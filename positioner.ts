import * as fs from 'async-file';
import * as path from 'path'
import { Recording, Delta, BodyPosition, LimbPosition, LimbDelta } from './models';

export class Positioner {

    /* If less than this threshold, considered to be straight */
    private BEND_THRESHOLD = 0.1

    /* If distance is less than this threshold considered to be at some position */
    private POSITION_THRESHOLD = 5;

    public async LoadRecording(fileName: string) {
        let filepath = path.join(process.cwd(), `./data/${fileName}`)

       // let path = process.cwd() + "data\\" + fileName
        let recordingJson = await fs.readFile(filepath)
        let recording = JSON.parse(recordingJson)
    }

    public LimbDelta(expertLimb: LimbPosition, noviceLimb: LimbPosition) : LimbDelta {
        return {
            deltaX: expertLimb.x - noviceLimb.x,
            deltaY: expertLimb.y - noviceLimb.y,
            occluded: expertLimb.occluded || noviceLimb.occluded
        } as LimbDelta
    }

    public IsLimbBent(limb1: LimbPosition, limb2: LimbPosition, limb3: LimbPosition) : boolean {
        let angle = Math.abs((limb1.y - limb2.y) * (limb1.x - limb3.x) - (limb1.y - limb3.y) * (limb1.x - limb2.x)) 
        return angle < this.BEND_THRESHOLD
    }

    public IsMatched(ld: LimbDelta) : boolean {
        let length = Math.sqrt((ld.deltaX * ld.deltaX) + (ld.deltaY * ld.deltaY))
        return length < this.POSITION_THRESHOLD
    }

    public GetDeltas(expert: Recording, novice: BodyPosition): Delta[] {
        return expert.frames.map(e => this.GetDelta(e, novice))
    }

    public GetBestExpertFrame(expert: Recording, novice: BodyPosition): any {
        // Calculate all the deltas
        let deltas = this.GetDeltas(expert, novice)
    }

    public GetDelta(expert: BodyPosition, novice: BodyPosition): Delta {
        let leftHandDelta = this.LimbDelta(expert.leftHand, novice.leftHand) as LimbDelta
        let rightHandDelta = this.LimbDelta(expert.rightHand, novice.rightHand) as LimbDelta
        let leftFootDelta = this.LimbDelta(expert.leftFoot, novice.leftFoot) as LimbDelta
        let rightFootDelta = this.LimbDelta(expert.rightFoot, novice.rightFoot) as LimbDelta

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
            leftHandMatched: this.IsMatched(leftHandDelta),
            rightHandMatched: this.IsMatched(leftHandDelta),
            leftFootMatched: this.IsMatched(leftHandDelta),
            rightFootMatched: this.IsMatched(leftHandDelta)
        } as Delta
    }
    public async Run() {
        let recording = await this.LoadRecording("Route1Expert.json")
    }
}