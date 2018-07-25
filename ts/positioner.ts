/* eslint-disable */
/* eslint-disable import/first */

import { RenderSet } from './RenderSet'
import { Recording, Delta, BodyPosition, LimbPosition, LimbDelta, LimbHistory, Route, HoldPosition } from './models';

let expertRecordingRaw = require(`./data/joints_route2_climb2.json`) 
let noviceRecordingRaw = require(`./data/joints_route2_climb4.json`) 
let route = require("./data/route2.json") as Route

// Little hack to adapt the json format
let expertRecording : Recording = {frames:Array()}
for (var f in expertRecordingRaw) {
    console.log(f)
    let b : BodyPosition = expertRecordingRaw[f][0]
    expertRecording.frames.push(b)
}

// Little hack to adapt the json format
let noviceRecording : Recording  = {frames:Array()}
for (var f in noviceRecordingRaw) {
    console.log(f)
    let b : BodyPosition = noviceRecordingRaw[f][0]
    noviceRecording.frames.push(b)
}

console.log(expertRecording)
console.log(noviceRecording)
console.log(route)

export class Positioner {

    /* If less than this threshold, considered to be straight */
    private BEND_THRESHOLD = 0.1

    /* If distance is less than this threshold considered to be at some position */
    private POSITION_THRESHOLD = 3;


    /* If limb is within LIMB_HOLD_THRESHOLD of hold position * radius multiplier
    for LIMB_HOLD_MIN_FRAMES, limb is considered to be on that hold */
    private HOLD_RADIUS_MULTIPLIER = 2;
    private LIMB_HOLD_THRESHOLD = 5;
    private LIMB_HOLD_MAX_FRAME_MOVEMENT = 20;

    public LimbDistance(Limb1: LimbPosition, Limb2: LimbPosition) : number {
        let deltaX = Limb1.x - Limb2.x
        let deltaY = Limb1.y - Limb2.y
        let distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY))
        return distance;

    }

    public LimbDelta(expertLimb: LimbPosition, noviceLimb: LimbPosition) : LimbDelta {
        let distance = this.LimbDistance(expertLimb, noviceLimb);
        let matched = this.IsMatched(distance)

        return {
            distance,
            matched,
            occluded: noviceLimb.occluded
        } as LimbDelta
    }

    public IsLimbBent(limb1: LimbPosition, limb2: LimbPosition, limb3: LimbPosition) : boolean {
        let angle = Math.abs((limb1.y - limb2.y) * (limb1.x - limb3.x) - (limb1.y - limb3.y) * (limb1.x - limb2.x)) 
        return angle < this.BEND_THRESHOLD
    }

    public IsMatched(distance: number) : boolean {
        return distance < this.POSITION_THRESHOLD
    }

    /* Return list of Deltas for each frame in expert recording */
    public GetDeltas(expert: Recording, novice: BodyPosition): Delta[] {
        return expert.frames.map(e => this.GetDelta(e, novice))
    }

    public GetBestExpertFrame(deltas: Delta[], novice: BodyPosition): Delta {

        // Get largest match
        let mostMatches = 0
        deltas.map(d => { mostMatches = Math.max(mostMatches, d.matchCount) })

        // Filter to ones with max matches
        let candidateDeltas = deltas.filter(d => d.matchCount === mostMatches)

        // Of the remaining find one with smallest delta
        let smallestDistance = Number.MAX_SAFE_INTEGER;
        let bestDelta = candidateDeltas[0]
        candidateDeltas.map(d => {
            let totalDistance =
                d.leftHand.distance +
                d.rightHand.distance +
                d.leftFoot.distance +
                d.rightFoot.distance +
                d.leftHip.distance +
                d.rightHip.distance
            if (totalDistance < smallestDistance) {
                smallestDistance = totalDistance
                bestDelta = d
            } 
        })
        return bestDelta
    }

    /* Return next frame containing a hold change */
    public GetNextHoldChangeFrame(startDelta: Delta, deltas: Delta[], expert: Recording) {

    }

    public GetDelta(expert: BodyPosition, novice: BodyPosition): Delta {
        let leftHandDelta = this.LimbDelta(expert.leftHand, novice.leftHand) as LimbDelta
        let rightHandDelta = this.LimbDelta(expert.rightHand, novice.rightHand) as LimbDelta
        let leftFootDelta = this.LimbDelta(expert.leftFoot, novice.leftFoot) as LimbDelta
        let rightFootDelta = this.LimbDelta(expert.rightFoot, novice.rightFoot) as LimbDelta
        let matchCount = (leftHandDelta.matched ? 1:0) + (rightHandDelta.matched ? 1:0) + (leftFootDelta.matched ? 1:0) + (rightFootDelta.matched ? 1:0)

        return {
            leftHand: leftHandDelta,
            rightHand: rightHandDelta,
            leftFoot: leftFootDelta,
            rightFoot: rightFootDelta,
            leftHip: this.LimbDelta(expert.leftHip, novice.leftHip),
            rightHip: this.LimbDelta(expert.rightHip, novice.rightHip),
            leftArmBent: this.IsLimbBent(novice.leftHand, novice.leftElbow, novice.leftShoulder),
            rightArmBent: this.IsLimbBent(novice.rightHand, novice.rightElbow, novice.rightShoulder),
            leftLegBent: this.IsLimbBent(novice.leftFoot, novice.leftKnee, novice.leftHip),
            rightLegBent: this.IsLimbBent(novice.rightFoot, novice.rightShoulder, novice.rightHip),
            matchCount
        } as Delta
    }

    public LimbOnHold(limb: LimbPosition, routeMap: Route): boolean {
        console.log(`Checkling limb position against ${routeMap.holds.length} holds in route`)
        for (var hold of routeMap.holds) {
            let deltaX = limb.x - hold.x
            let deltaY = limb.y - hold.y
            let distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY))
            if (distance <= hold.radius + this.LIMB_HOLD_THRESHOLD) {
                // Now check if the limb has moved too much
                /* Actually this doesn't work because we call LimbOnHold before building history 
                if (limb.history.distanceMoved[1] > this.LIMB_HOLD_MAX_FRAME_MOVEMENT) {
                    return false;
                }
                */
                return true;
            }
        }
        return false;
    }

    public AnnotateRecording (inputRecording: Recording, routeMap: Route) {
        const maxHistory:number = 30

        var positionHistory: BodyPosition[] = []
        // For each frame, we'll look back in history and figure out how far it's moved in the past maxHistory frames
        for (var frame of inputRecording.frames) {
            // First we'll check which (if any) limbs are on holds in this frame.
            // No need to check hips and shoulders and stuff.
            console.log(`Annotating frame ${frame.frameNumber} of ${inputRecording.frames.length}`)
            frame.leftHand.onHold = this.LimbOnHold(frame.leftHand, routeMap)
            frame.rightHand.onHold = this.LimbOnHold(frame.rightHand, routeMap)
            frame.leftFoot.onHold = this.LimbOnHold(frame.leftFoot, routeMap)
            frame.rightFoot.onHold = this.LimbOnHold(frame.rightFoot, routeMap)  
            console.log(`Frame ${frame.frameNumber} | onHolds: LH ${frame.leftHand.onHold}, RH: ${frame.rightHand.onHold}, LF ${frame.leftFoot.onHold}, RF: ${frame.rightFoot.onHold}`)    
            // We'll store the distance each limb moved for each frame count between 0 and maxHistory
            // so later on we can say leftHand.history.distanceMoved[1] or leftHand.history.distanceMoved[10]
            // for 1 or 10 frames
            //
            // Start by adding this frame so deltas with index 0 are also this frame
            positionHistory.unshift(frame)
            // If we've got more history than we can use, remove the oldest one
            if (positionHistory.length > maxHistory) {
                positionHistory.pop()
            }          
            // Make sure our arrays actually exist because they don't when the file is first loaded
            // This is probably a terrible pattern 
            let zeroHistory : LimbHistory = {distanceMoved:[0]}
            frame.leftHand.history = zeroHistory
            frame.leftHand.history = zeroHistory
            frame.leftElbow.history = zeroHistory
            frame.leftShoulder.history = zeroHistory 
            frame.rightHand.history = zeroHistory
            frame.rightElbow.history = zeroHistory
            frame.rightShoulder.history = zeroHistory
            frame.leftFoot.history = zeroHistory
            frame.leftKnee.history = zeroHistory
            frame.rightFoot.history = zeroHistory
            frame.rightKnee.history = zeroHistory
            frame.leftHip.history = zeroHistory
            frame.rightHip.history = zeroHistory

            for (var i = 0; i<maxHistory; i++) {
                // Determine what frame we'll use to compare
                var deltaFrame : BodyPosition
                if (positionHistory.length > i) {
                    deltaFrame = positionHistory[i]
                } else {
                    // We don't have the full buffer yet, so use the oldest
                    deltaFrame = positionHistory[positionHistory.length - 1]
                } 
                frame.leftHand.history.distanceMoved.unshift(this.LimbDistance(frame.leftHand,deltaFrame.leftHand))
                frame.leftElbow.history.distanceMoved.unshift(this.LimbDistance(frame.leftElbow,deltaFrame.leftElbow))
                frame.leftShoulder.history.distanceMoved.unshift(this.LimbDistance(frame.leftShoulder,deltaFrame.leftShoulder))
                frame.rightHand.history.distanceMoved.unshift(this.LimbDistance(frame.rightHand,deltaFrame.rightHand))
                frame.rightElbow.history.distanceMoved.unshift(this.LimbDistance(frame.rightElbow,deltaFrame.rightElbow))
                frame.rightShoulder.history.distanceMoved.unshift(this.LimbDistance(frame.rightShoulder,deltaFrame.rightShoulder))
                frame.leftFoot.history.distanceMoved.unshift(this.LimbDistance(frame.leftFoot,deltaFrame.leftFoot))
                frame.leftKnee.history.distanceMoved.unshift(this.LimbDistance(frame.leftKnee,deltaFrame.leftKnee))
                frame.rightFoot.history.distanceMoved.unshift(this.LimbDistance(frame.rightFoot,deltaFrame.rightFoot))
                frame.rightKnee.history.distanceMoved.unshift(this.LimbDistance(frame.rightKnee,deltaFrame.rightKnee))
                frame.leftHip.history.distanceMoved.unshift(this.LimbDistance(frame.leftHip,deltaFrame.leftHip))
                frame.rightHip.history.distanceMoved.unshift(this.LimbDistance(frame.rightHip,deltaFrame.rightHip))
            }
       }
    }

    public async Run() {
        console.log(`Loaded expert climber with ${expertRecording.frames.length} frames`)
        console.log(`Loaded novice climber with ${noviceRecording.frames.length} frames`)
        console.log(`Loaded route "${route.name}" with ${route.holds.length} holds`)      

        // Add movement history and frames where limbs are on holds to each of the recordings
        this.AnnotateRecording(expertRecording, route)
        this.AnnotateRecording(noviceRecording, route)

        let firstPos = noviceRecording.frames[0]

        // Calculate all the deltas
        let deltas = this.GetDeltas(expertRecording, firstPos)
        let bestDelta = this.GetBestExpertFrame(deltas, firstPos)
        let nextDelta = this.GetNextHoldChangeFrame(bestDelta, deltas, expertRecording)

        RenderSet.AddBodyPosition(expertRecording.frames[0])
    }
}