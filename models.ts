export interface LimbPosition {
    x: number
    y: number
    onHold?: boolean
    occluded?: boolean
}

export interface BodyPosition {
    leftHand: LimbPosition
    leftElbow: LimbPosition
    leftShoulder: LimbPosition
    rightHand: LimbPosition
    rightElbow: LimbPosition
    rightShoulder: LimbPosition
    leftFoot: LimbPosition
    leftKnee: LimbPosition
    rightFoot: LimbPosition
    rightKnee: LimbPosition
    leftHip: LimbPosition
    rightHip: LimbPosition
}

export interface Recording {
    frames: BodyPosition[]
}

export interface LimbDelta {
    deltaX: number
    deltaY: number
    onHold?: boolean
    occluded?: boolean
}

export interface Delta {
    leftHand: LimbDelta
    leftHandMatched: boolean
    leftArmBent: boolean
    rightHand: LimbDelta
    rightHandMatched: boolean
    rightArmBent: boolean
    leftFoot: LimbDelta
    leftFootMatched: boolean
    leftLegBent: boolean
    rightFoot: LimbDelta
    rightFootMatched: boolean
    rightLegBent: boolean
    leftHip: LimbDelta
    rightHip: LimbDelta,
    matchCount: number
}



