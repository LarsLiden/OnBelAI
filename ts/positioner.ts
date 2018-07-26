/* eslint-disable */
/* eslint-disable import/first */

import { RenderSet } from './RenderSet'
import { Recording, Delta, BodyPosition, AnimationSet, LimbPosition, LimbDelta, LimbHistory, Route, HoldPosition, Color } from './models';
import { Suggester } from './suggester';

let expertRecordingRaw = require(`./data/route2-climb2-experienced-pausing.json`) 
let noviceRecordingRaw = require(`./data/route2-climb4-novice-pausing.json`) 
let route = require("./data/route2.json") as Route

// Little hack to adapt the json format
let expertRecording : Recording = {frames:Array()}
for (var f in expertRecordingRaw) {
    //console.log(f)
    let frameNumber: number = Number(f.match(/\d+/)[0])
    let b : BodyPosition = expertRecordingRaw[f][0]
    b.frameNumber = frameNumber
    expertRecording.frames.push(b)
}
expertRecording.frames.sort(function(a, b){return a.frameNumber - b.frameNumber});

// Little hack to adapt the json format
let noviceRecording : Recording  = {frames:Array()}
for (var f in noviceRecordingRaw) {
    //console.log(f)
    let frameNumber: number = Number(f.match(/\d+/)[0])
    let b : BodyPosition = noviceRecordingRaw[f][0]
    b.frameNumber = frameNumber
    noviceRecording.frames.push(b)
}
noviceRecording.frames.sort(function(a, b){return a.frameNumber - b.frameNumber});

/*
console.log(expertRecording)
console.log(noviceRecording)
console.log(route)
*/

export class Positioner {

    /* If less than this threshold, considered to be straight */
    private BEND_THRESHOLD = 0.1

    /* If distance is less than this threshold considered to be at same position */
    private POSITION_THRESHOLD = 100;

    private curFrame = 0;

    /* If limb is within LIMB_HOLD_THRESHOLD of hold position * radius multiplier
    for LIMB_HOLD_MIN_FRAMES, limb is considered to be on that hold */
    private HOLD_RADIUS_MULTIPLIER = 2;
    private LIMB_HOLD_THRESHOLD = 50;
    private LIMB_HOLD_MAX_FRAME_MOVEMENT = 20;
    /* When limb occluded max frame to check on each side for non-occluded limb */
    private MAX_OCCLUDE_CHECK_FRAMES = 10

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
            deltaX: expertLimb.x - noviceLimb.x,
            deltaY: expertLimb.y - noviceLimb.y,
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
    
    public GetBestExpertFrame(deltas: Delta[], novice: BodyPosition, lastBestIndex: number): Delta {

        // Get largest match
        let mostMatches = 0
        let rDeltas = deltas.filter(d => d.expertFrame.frameNumber >= lastBestIndex)
        rDeltas.map(d => { mostMatches = Math.max(mostMatches, d.matchCount) })

        // Filter to ones with max matches
        let candidateDeltas = rDeltas.filter(d => d.matchCount === mostMatches)

        candidateDeltas = deltas // temp - don't filter by holds
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

        console.log('Best delta index - ' + deltas.findIndex(d => d === bestDelta));
        return bestDelta
    }

    /* Return next frame containing a hold change */
    public GetNextHoldChangeFrame(startDelta: Delta, deltas: Delta[], expert: Recording): Delta {

        const bestDeltaIndex = deltas.findIndex(d => startDelta === d);
        if (bestDeltaIndex === -1) {
            return;
        }

        let nextBestIndex = -1;
        for (let i=bestDeltaIndex+1; i<expert.frames.length; i++) {
            let d = this.GetDelta(expert.frames[bestDeltaIndex], expert.frames[i]);

            if (!this.IsMatched(d.leftHand.distance) || !this.IsMatched(d.rightHand.distance) || 
                    !this.IsMatched(d.leftFoot.distance) || !this.IsMatched(d.rightFoot.distance)) {
                        nextBestIndex = i;
                        break;
            }
        }

        if (nextBestIndex !== -1) {
            console.log('The next best frame index is - ' + nextBestIndex);
            return deltas[nextBestIndex];
        }

        return undefined;
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
            matchCount,
            expertFrame: expert,
            noviceFrame: novice
        } as Delta
    }

    public SetOnHold(routeMap: Route, bodyPosition: BodyPosition) {
        // First clear the holds
        for (var hold of routeMap.holds) {
            hold.onHold = false
        }
        if (bodyPosition.leftHand.onHold)  {
            bodyPosition.leftHand.onHold.onHold = true
        }
        if (bodyPosition.rightHand.onHold)  {
            bodyPosition.rightHand.onHold.onHold = true
        }        
        if (bodyPosition.leftFoot.onHold)  {
            bodyPosition.leftFoot.onHold.onHold = true
        }        
        if (bodyPosition.rightFoot.onHold)  {
            bodyPosition.rightFoot.onHold.onHold = true
        }
    }
    public LimbOnHold(limb: LimbPosition, routeMap: Route, colorHolds: boolean): HoldPosition {
        //console.log(`Checkling limb position against ${routeMap.holds.length} holds in route`)
        let bestHold = null
        let bestDistance = 100000
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
                if (distance < bestDistance) {
                    bestHold = hold
                    bestDistance = distance
                }
            }
        }
        if (bestHold && colorHolds) {
            bestHold.onHold = true
        }
        return bestHold;
    }

    public FillInOcclusions(recording: Recording) {

        for (let index = 0; index < recording.frames.length; index++) {
            let curFrame = recording.frames[index]

            // LEFT HAND
            if (curFrame.leftHand.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftHand.occluded) {
                        curFrame.leftHand = nextFrame.leftHand
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftHand.occluded) {
                        curFrame.leftHand = prevFrame.leftHand
                        break
                    }
                }
            }

            // LEFT ELBOW
            if (curFrame.leftElbow.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftElbow.occluded) {
                        curFrame.leftElbow = nextFrame.leftElbow
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftElbow.occluded) {
                        curFrame.leftElbow = prevFrame.leftElbow
                        break
                    }
                }
            }

            // LEFT SHOULDER
            if (curFrame.leftShoulder.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftShoulder.occluded) {
                        curFrame.leftShoulder = nextFrame.leftShoulder
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftShoulder.occluded) {
                        curFrame.leftShoulder = prevFrame.leftShoulder
                        break
                    }
                }
            }

            // LEFT HIP
            if (curFrame.leftHip.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftHip.occluded) {
                        curFrame.leftHip = nextFrame.leftHip
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftHip.occluded) {
                        curFrame.leftHip = prevFrame.leftHip
                        break
                    }
                }
            }

            // LEFT KNEE
            if (curFrame.leftKnee.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftKnee.occluded) {
                        curFrame.leftKnee = nextFrame.leftKnee
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftKnee.occluded) {
                        curFrame.leftKnee = prevFrame.leftKnee
                        break
                    }
                }
            }

            // LEFT FOOT
            if (curFrame.leftFoot.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.leftFoot.occluded) {
                        curFrame.leftFoot = nextFrame.leftFoot
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.leftFoot.occluded) {
                        curFrame.leftFoot = prevFrame.leftFoot
                        break
                    }
                }
            }

            // LEFT HAND
            if (curFrame.rightHand.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightHand.occluded) {
                        curFrame.rightHand = nextFrame.rightHand
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightHand.occluded) {
                        curFrame.rightHand = prevFrame.rightHand
                        break
                    }
                }
            }

            // right ELBOW
            if (curFrame.rightElbow.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightElbow.occluded) {
                        curFrame.rightElbow = nextFrame.rightElbow
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightElbow.occluded) {
                        curFrame.rightElbow = prevFrame.rightElbow
                        break
                    }
                }
            }

            // right SHOULDER
            if (curFrame.rightShoulder.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightShoulder.occluded) {
                        curFrame.rightShoulder = nextFrame.rightShoulder
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightShoulder.occluded) {
                        curFrame.rightShoulder = prevFrame.rightShoulder
                        break
                    }
                }
            }

            // right HIP
            if (curFrame.rightHip.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightHip.occluded) {
                        curFrame.rightHip = nextFrame.rightHip
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightHip.occluded) {
                        curFrame.rightHip = prevFrame.rightHip
                        break
                    }
                }
            }

            // right KNEE
            if (curFrame.rightKnee.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightKnee.occluded) {
                        curFrame.rightKnee = nextFrame.rightKnee
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightKnee.occluded) {
                        curFrame.rightKnee = prevFrame.rightKnee
                        break
                    }
                }
            }

            // right FOOT
            if (curFrame.rightFoot.occluded) {
                // Search ahead 5 frames on each side for non-occluded limb
                for (let offset = 1; offset < this.MAX_OCCLUDE_CHECK_FRAMES; offset++) {
                    let nextFrame = recording.frames[index+offset]
                    if (nextFrame && !nextFrame.rightFoot.occluded) {
                        curFrame.rightFoot = nextFrame.rightFoot
                        break
                    }
                    let prevFrame = recording.frames[index-offset]
                    if (prevFrame && !prevFrame.rightFoot.occluded) {
                        curFrame.rightFoot = prevFrame.rightFoot
                        break
                    }
                }
            }
        }
    }

    public AnnotateRecording (inputRecording: Recording, routeMap: Route, colorHolds: boolean) {
        const maxHistory:number = 30

        var positionHistory: BodyPosition[] = []
        // For each frame, we'll look back in history and figure out how far it's moved in the past maxHistory frames
        let f:number = 0
        for (var frame of inputRecording.frames) {
            // First we'll check which (if any) limbs are on holds in this frame.
            // No need to check hips and shoulders and stuff.
            //console.log(`Annotating frame ${frame.frameNumber} of ${inputRecording.frames.length}`)
            console.log(`Annotating frame ${f} of ${inputRecording.frames.length}`)
            frame.leftHand.onHold = this.LimbOnHold(frame.leftHand, routeMap, colorHolds)
            frame.rightHand.onHold = this.LimbOnHold(frame.rightHand, routeMap, colorHolds)
            frame.leftFoot.onHold = this.LimbOnHold(frame.leftFoot, routeMap, colorHolds)
            frame.rightFoot.onHold = this.LimbOnHold(frame.rightFoot, routeMap, colorHolds)  
            let numLimbsOnHolds : number = (frame.leftHand.onHold ? 1: 0) + (frame.rightHand.onHold ? 1: 0) 
                + (frame.leftFoot.onHold ? 1: 0) + (frame.rightFoot.onHold ? 1: 0)
            if (numLimbsOnHolds > 0) {
                console.log(`Frame ${f} | ${numLimbsOnHolds} limbs on holds: LH ${frame.leftHand.onHold}, RH: ${frame.rightHand.onHold}, LF ${frame.leftFoot.onHold}, RF: ${frame.rightFoot.onHold}`)    
            }
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
        f = f+1
       }
    }

    public async Run() {
        console.log(`Loaded expert climber with ${expertRecording.frames.length} frames`)
        console.log(`Loaded novice climber with ${noviceRecording.frames.length} frames`)
        console.log(`Loaded route "${route.name}" with ${route.holds.length} holds`)      

        const suggester = new Suggester();

        this.FillInOcclusions(expertRecording)
        this.FillInOcclusions(noviceRecording)

        // Add movement history and frames where limbs are on holds to each of the recordings
        this.AnnotateRecording(expertRecording, route, false)
        this.AnnotateRecording(noviceRecording, route, true)

        RenderSet.AddHolds(route)

        let firstPos = noviceRecording.frames[0]
        let expertColor: Color = {red: 0.6, blue: 0.15, green: 0.15, alpha: 0.5}
        let noviceColor: Color = {red: 0.5, blue: 1, green: 0.5, alpha: 1.0}
        let noviceHoldColor: Color = {red: 0.5, blue: 1, green: 0.9, alpha: 1.0}

        let animationSet: AnimationSet[] = []
        let lastBestFrame = 0
        for (let index in noviceRecording.frames) {
            // Calculate all the deltas
            let deltas = this.GetDeltas(expertRecording, noviceRecording.frames[index])
            let bestDelta = this.GetBestExpertFrame(deltas, noviceRecording.frames[index], lastBestFrame)
            lastBestFrame = bestDelta.expertFrame.frameNumber
            let nextDelta = this.GetNextHoldChangeFrame(bestDelta, deltas, expertRecording)
            animationSet.push({
                bestDelta,
                nextDelta
            } as AnimationSet) 
        }

        RenderSet.AddBodyPosition(animationSet[this.curFrame].bestDelta.expertFrame, expertColor, expertColor)
        RenderSet.AddBodyPosition(animationSet[this.curFrame].bestDelta.noviceFrame, noviceColor, noviceHoldColor)


        // repeat with the interval of 2 seconds
        let timerId = setInterval(() => {
            this.curFrame++;
            if (this.curFrame == animationSet.length) {
                this.curFrame = 0
            }
            RenderSet.ClearBodyPositions();
            
            this.SetOnHold(route, animationSet[this.curFrame].bestDelta.noviceFrame)
            RenderSet.AddHolds(route)

            RenderSet.AddBodyPosition(animationSet[this.curFrame].bestDelta.noviceFrame, noviceColor, noviceHoldColor)
            RenderSet.AddBodyPosition(animationSet[this.curFrame].bestDelta.expertFrame, expertColor, expertColor)

            //let suggestions = suggester.getSuggestions(animationSet[this.curFrame].bestDelta)
            RenderSet.suggestions = suggester.getSuggestions(animationSet[this.curFrame].bestDelta)
        }, 300);
    }
}