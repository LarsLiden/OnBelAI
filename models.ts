export interface LimbPosition {
    x: number
    y: number
    onHold?: boolean
    occluded?: boolean
}

export interface BodyPosition {
    leftHand: LimbPosition,
    leftElbow: LimbPosition,
    leftShoulder: LimbPosition,
    rightHand: LimbPosition,
    rightElbow: LimbPosition,
    rightShoulder: LimbPosition,
    hip: LimbPosition
}

export interface Recording {
    frames: BodyPosition[]
}

