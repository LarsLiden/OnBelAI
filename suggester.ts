import { Delta, LimbDelta } from "./models";

export class Suggester {

    public getSuggestions(delta: Delta): string[] {
        const ret: string[] = [];

        // toes
        // if (!leftFootMatched) {
            // Move up/down
            if (this.isInFirstQuadrant(delta.leftFoot) || this.isInSecondQuadrant(delta.leftFoot)) {
                ret.push('Stand on your left toe');
            } else if (this.isInThirdQuadrant(delta.leftFoot) || this.isInFourthQuadrant(delta.leftFoot)) {
                ret.push('Straighten your left toe')
            }
        // }

        // if (!rightFootMatched) {
            // Move up/down
            if (this.isInFirstQuadrant(delta.rightFoot) || this.isInSecondQuadrant(delta.rightFoot)) {
                ret.push('Stand on your right toe');
            } else if (this.isInThirdQuadrant(delta.rightFoot) || this.isInFourthQuadrant(delta.rightFoot)) {
                ret.push('Straighten your right toe')
            }
        // }

        //hips

        // hands
        // if (!leftHandMatched) {

        // }
        // if (!rightHandMatched) {

        // }

        return ret;
    }

    private isInFirstQuadrant(limbDelta: LimbDelta): boolean {
        return limbDelta.deltaX > 0 && limbDelta.deltaY > 0;
    }

    private isInSecondQuadrant(limbDelta: LimbDelta): boolean {
        return limbDelta.deltaX < 0 && limbDelta.deltaY > 0;
    }

    private isInThirdQuadrant(limbDelta: LimbDelta): boolean {
        return limbDelta.deltaX < 0 && limbDelta.deltaY < 0;
    }

    private isInFourthQuadrant(limbDelta: LimbDelta): boolean {
        return limbDelta.deltaX > 0 && limbDelta.deltaY < 0;
    }
}