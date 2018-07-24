import { Delta, LimbDelta } from "./models";

export class Suggester {

    public getSuggestions(delta: Delta): string[] {
        const ret: string[] = [];

        // toes
        if (!delta.leftFoot.matched) {
            // Move up/down
            if (this.isInFirstQuadrant(delta.leftFoot) || this.isInSecondQuadrant(delta.leftFoot)) {
                ret.push('Stand on your left toe');
            } else if (this.isInThirdQuadrant(delta.leftFoot) || this.isInFourthQuadrant(delta.leftFoot)) {
                ret.push('Straighten your left toe')
            }
        }

        if (!delta.rightFoot.matched) {
            // Move up/down
            if (this.isInFirstQuadrant(delta.rightFoot) || this.isInSecondQuadrant(delta.rightFoot)) {
                ret.push('Stand on your right toe');
            } else if (this.isInThirdQuadrant(delta.rightFoot) || this.isInFourthQuadrant(delta.rightFoot)) {
                ret.push('Straighten your right toe')
            }
        }

        //hips
        if (this.isInFirstQuadrant(delta.rightHip)) {
            ret.push('Move hips to the right and up');
        } else if (this.isInSecondQuadrant(delta.rightHip)) {
            ret.push('Move hips to the left and up');
        } else if (this.isInThirdQuadrant(delta.rightHip)) {
            ret.push('Move hips to the left and down');
        } else if (this.isInFourthQuadrant(delta.rightHip)) {
            ret.push('Move hips to the right and down');
        }

        // hands
        if (!delta.leftHand.matched) {
            if (this.isInFirstQuadrant(delta.leftHand)) {
                ret.push('Reach right and up with your left hand');
            } else if (this.isInSecondQuadrant(delta.leftHand)) {
                ret.push('Reach left and up with your left hand');
            } else if (this.isInThirdQuadrant(delta.leftHand)) {
                ret.push('Reach left and down with your left hand');
            } else if (this.isInFourthQuadrant(delta.leftHand)) {
                ret.push('Reach right and down with your left hand');
            }
        }

        if (!delta.rightHand.matched) {
            if (this.isInFirstQuadrant(delta.rightHand)) {
                ret.push('Reach right and up with your right hand');
            } else if (this.isInSecondQuadrant(delta.rightHand)) {
                ret.push('Reach left and up with your right hand');
            } else if (this.isInThirdQuadrant(delta.rightHand)) {
                ret.push('Reach left and down with your right hand');
            } else if (this.isInFourthQuadrant(delta.rightHand)) {
                ret.push('Reach right and down with your right hand');
            }
        }

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