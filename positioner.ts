import * as fs from 'async-file';
import * as path from 'path'
import { Recording, Delta, BodyPosition, LimbPosition, LimbDelta } from './models';

export class Positioner {

    /* If less than this threshold, considered to be straight */
    private BEND_THRESHOLD = 0.1

    /* If distance is less than this threshold considered to be at some position */
    private POSITION_THRESHOLD = 5;

    public async LoadRecording(fileName: string) : Promise<Recording> {
        let filepath = path.join(process.cwd(), `./data/${fileName}`)

       // let path = process.cwd() + "data\\" + fileName
        let recordingJson = await fs.readFile(filepath)
        return JSON.parse(recordingJson)
    }

    public LimbDelta(expertLimb: LimbPosition, noviceLimb: LimbPosition) : LimbDelta {
        let deltaX = expertLimb.x - noviceLimb.x
        let deltaY = expertLimb.y - noviceLimb.y

        return {
            deltaX,
            deltaY,
            distance: Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)),
            occluded: expertLimb.occluded || noviceLimb.occluded
        } as LimbDelta
    }

    public IsLimbBent(limb1: LimbPosition, limb2: LimbPosition, limb3: LimbPosition) : boolean {
        let angle = Math.abs((limb1.y - limb2.y) * (limb1.x - limb3.x) - (limb1.y - limb3.y) * (limb1.x - limb2.x)) 
        return angle < this.BEND_THRESHOLD
    }

    public IsMatched(ld: LimbDelta) : boolean {
        return ld.distance < this.POSITION_THRESHOLD
    }

    /* Return list of Deltas for each frame in expert recording */
    public GetDeltas(expert: Recording, novice: BodyPosition): Delta[] {
        return expert.frames.map(e => this.GetDelta(e, novice))
    }

    public GetBestExpertFrame(expert: Recording, novice: BodyPosition): Delta {
        // Calculate all the deltas
        let deltas = this.GetDeltas(expert, novice)

        // Get largest match
        let mostMatches = 0
        deltas.map(d => { mostMatches = Math.max(mostMatches, d.matchCount) })

        // Filter to ones with max matches
        deltas = deltas.filter(d => d.matchCount === mostMatches)

        // Of the remaining find one with smallest delta
        let smallestDistance = Number.MAX_SAFE_INTEGER;
        let bestDelta = deltas[0]
        deltas.map(d => {
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

    public GetDelta(expert: BodyPosition, novice: BodyPosition): Delta {
        let leftHandDelta = this.LimbDelta(expert.leftHand, novice.leftHand) as LimbDelta
        let rightHandDelta = this.LimbDelta(expert.rightHand, novice.rightHand) as LimbDelta
        let leftFootDelta = this.LimbDelta(expert.leftFoot, novice.leftFoot) as LimbDelta
        let rightFootDelta = this.LimbDelta(expert.rightFoot, novice.rightFoot) as LimbDelta
        let leftHandMatched = this.IsMatched(leftHandDelta)
        let rightHandMatched = this.IsMatched(leftHandDelta)
        let leftFootMatched = this.IsMatched(leftHandDelta)
        let rightFootMatched=  this.IsMatched(leftHandDelta)
        let matchCount = (leftHandMatched ? 1:0) + (rightHandMatched ? 1:0) + (leftFootMatched ? 1:0) + (rightFootMatched ? 1:0)

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
            leftHandMatched,
            rightHandMatched,
            leftFootMatched,
            rightFootMatched,
            matchCount
        } as Delta
    }
    public async Run() {
        let expertRecording = await this.LoadRecording("Route1Expert.json")
        let noviceRecording = await this.LoadRecording("Route1Novice1.json")

        let firstPos = noviceRecording.frames[0]
        let bestDelta = this.GetBestExpertFrame(expertRecording, firstPos)
    }
}