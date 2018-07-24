import * as fs from 'async-file';
import * as path from 'path'
let regl = require('regl')({extensions: 'angle_instanced_arrays'})
let line2d = require('regl-line2d')(regl)
import { Recording, Delta, BodyPosition, LimbPosition, LimbDelta } from './models';

export class Positioner {

    /* If less than this threshold, considered to be straight */
    private BEND_THRESHOLD = 0.1

    /* If distance is less than this threshold considered to be at some position */
    private POSITION_THRESHOLD = 3;

    public async LoadRecording(fileName: string) : Promise<Recording> {
        let filepath = path.join(process.cwd(), `./data/${fileName}`)

       // let path = process.cwd() + "data\\" + fileName
        let recordingJson = await fs.readFile(filepath)
        return JSON.parse(recordingJson)
    }

    public LimbDelta(expertLimb: LimbPosition, noviceLimb: LimbPosition) : LimbDelta {
        let deltaX = expertLimb.x - noviceLimb.x
        let deltaY = expertLimb.y - noviceLimb.y
        let distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY))
        let matched = this.IsMatched(distance)

        return {
            deltaX,
            deltaY,
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
    public async Run() {
        let expertRecording = await this.LoadRecording("Route1Expert.json")
        let noviceRecording = await this.LoadRecording("Route1Novice1.json")

        let firstPos = noviceRecording.frames[0]

        // Calculate all the deltas
        let deltas = this.GetDeltas(expertRecording, firstPos)
        let bestDelta = this.GetBestExpertFrame(deltas, firstPos)
        let nextDelta = this.GetNextHoldChangeFrame(bestDelta, deltas, expertRecording)

        line2d.render({ thickness: 4, points: [0,0, 1,1, 1,0], close: true, color: 'red' })
    }
}