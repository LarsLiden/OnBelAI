export interface LimbPosition {
    x: number
    y: number
    onHold?: HoldPosition
    occluded?: boolean
    history?: LimbHistory
}

export interface LimbHistory {
    distanceMoved: number[]
}

export interface BodyPosition {
    frameNumber: number
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

    /* Distance of the limb to expert position */
    distance: number

    /* Is the limbed matched in position to the expert */
    matched: boolean

    /* Is the limb on a hold */
    onHold: HoldPosition

    /* Is the novice  limb occluded */
    occluded?: boolean
}

export interface Delta {
    leftHand: LimbDelta
    leftArmBent: boolean
    rightHand: LimbDelta
    rightArmBent: boolean
    leftFoot: LimbDelta
    leftLegBent: boolean
    rightFoot: LimbDelta
    rightLegBent: boolean
    leftHip: LimbDelta
    rightHip: LimbDelta
    matchCount: number

    expertFrame: BodyPosition
    noviceFrame: BodyPosition
}

export interface Route {
   name: string
   holds: HoldPosition[]
}

export interface HoldPosition {
    x: number
    y: number
    radius: number
    id?: string
    onHold: boolean
}

export interface Color {
    red: number
    green:number
    blue: number
    alpha: number
}

export interface AnimationSet {
    bestDelta: Delta
    nextDelta: Delta
}

