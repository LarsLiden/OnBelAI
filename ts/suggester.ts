import { Delta, LimbDelta } from "./models";
import { TTYAgent } from "./TTYAgent";

export class Suggester {

    public getSuggestions(delta: Delta): string[] {

        if (!delta) {
            //Testing code below
            // const retTest = ['Try bending your right arm',
            //     'Try straightening your left knee',
            //     'Reach for the next hold using your left hand'];
            // new TTYAgent().speak(retTest);
            return undefined;
        }

        if (!delta || delta.matchCount) {
            return undefined;
        }

        const ret: string[] = [];

        if (delta.matchCount < 3) {
            // novice and expert frames are not matched
            // Suggest moves to match at least 3 contact points.

            // toes
            if (!delta.leftFoot.matched) {
                // Move up/down
                if (this.isInFirstQuadrant(delta.leftFoot)) {
                    ret.push('Reach right and up with your left foot');
                } else if (this.isInSecondQuadrant(delta.leftFoot)) {
                    ret.push('Reach left and up with your left foot');
                } else if (this.isInThirdQuadrant(delta.leftFoot)) {
                    ret.push('Reach left and down with your left foot');
                } else if (this.isInFourthQuadrant(delta.leftFoot)) {
                    ret.push('Reach right and down with your left foot');
                }
            }
    
            if (!delta.rightFoot.matched) {
                // Move up/down
                if (this.isInFirstQuadrant(delta.rightFoot)) {
                    ret.push('Reach right and up with your right foot');
                } else if (this.isInSecondQuadrant(delta.rightFoot)) {
                    ret.push('Reach left and up with your right foot');
                } else if (this.isInThirdQuadrant(delta.rightFoot)) {
                    ret.push('Reach left and down with your right foot');
                } else if (this.isInFourthQuadrant(delta.rightFoot)) {
                    ret.push('Reach right and down with your right foot');
                }
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
        } else {
            // Novice and expert frames match on at least 3 contact points.
            // Suggestions related to hips, arms and legs.

            //hips and arms
            if (this.isInFirstQuadrant(delta.rightHip)) {
                // move right and up
                ret.push('Move hips to the right and up');

                // case - bend right arm
                if (!delta.rightArmBent) {
                    ret.push('Try bending your right arm');
                }

                // case - straighten left knee
                if (delta.leftLegBent) {
                    ret.push('Try straightening your left knee');
                }

                // case - bend right knee
                if (!delta.rightLegBent) {
                    ret.push('Try bending your right knee');
                }
            } else if (this.isInSecondQuadrant(delta.rightHip)) {
                // move left and up
                ret.push('Move hips to the left and up');
                
                // case - bend left arm
                if (!delta.leftArmBent) {
                    ret.push('Try bending your left arm');
                }

                // case - straighten right knee
                if (delta.rightLegBent) {
                    ret.push('Try straightening your right knee');
                }

                // case - bend left knee
                if (!delta.leftLegBent) {
                    ret.push('Try bending your left knee');
                }
            } else if (this.isInThirdQuadrant(delta.rightHip)) {
                // move left and down
                ret.push('Move hips to the left and down');

                // case - straighten right arm
                if (delta.rightArmBent) {
                    ret.push('Try straightening your right arm');
                }

                // case - bend left knee
                if (!delta.leftLegBent) {
                    ret.push('Try bending your left knee');
                }

                // case - straighten right knee
                if (delta.rightLegBent) {
                    ret.push('Try straightening your right knee');
                }
            } else if (this.isInFourthQuadrant(delta.rightHip)) {
                // move right and down
                ret.push('Move hips to the right and down');

                // case - straighten left arm
                if (delta.leftArmBent) {
                    ret.push('Try straightening your left arm');
                }

                // case - bend right knee
                if (!delta.rightLegBent) {
                    ret.push('Try bending your right knee');
                }
                
                // case - straighten left knee
                if (delta.leftLegBent) {
                    ret.push('Try straightening your left knee');
                }
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