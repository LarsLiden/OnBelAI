import { BodyPosition, Color, Route, HoldPosition } from "./models";


export interface Point {
    [index: number]: number;
}

export interface Line {
    start: Point,
    end: Point,
    color: Color
}

export interface Hold {
    center: Point,
    radius: number,
    name: String,
    color: Color
}

export interface Facet {
    [index: number]: Point
}

export class RenderSet {


    static lines: Array<Line> = []
    static holds: Array<Hold> = []

    public static suggestions: string[] = []

    public static ClearBodyPositions() {
        this.lines = []
    }

    public static ClearHolds() {
        this.holds = []
    }

    public static ClearAll() {
        this.ClearBodyPositions()
        this.ClearHolds()
    }

    public static AddBodyPosition(bodyPosition: BodyPosition, color: Color) {
        // Line from hand to elbow to shoulder
        this.AddLine(bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, bodyPosition.leftHand.x, bodyPosition.leftHand.y, color)
        this.AddLine(bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color);
        // Right hand to elbow to shoulder
        this.AddLine(bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, bodyPosition.rightHand.x, bodyPosition.rightHand.y, color);
        this.AddLine(bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        // Left leg, foot to knee to hip
        this.AddLine(bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, bodyPosition.leftFoot.x, bodyPosition.leftFoot.y, color);
        this.AddLine(bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, bodyPosition.leftHip.x, bodyPosition.leftHip.y, color);
        // Right leg, foot to knee to hip
        this.AddLine(bodyPosition.rightKnee.x, bodyPosition.rightKnee.y, bodyPosition.rightFoot.x, bodyPosition.rightFoot.y, color);
        this.AddLine(bodyPosition.rightKnee.x, bodyPosition.rightKnee.y, bodyPosition.rightHip.x, bodyPosition.rightHip.y, color);
        // Connect the shoulders
        if ((bodyPosition.leftShoulder.x * bodyPosition.leftShoulder.y * bodyPosition.rightShoulder.x * bodyPosition.rightShoulder.y) > 0) {
            let shoulderCenterX: number = (bodyPosition.leftShoulder.x + bodyPosition.rightShoulder.x) / 2
            let shoulderCenterY: number = (bodyPosition.leftShoulder.y + bodyPosition.rightShoulder.y) / 2
            this.AddLine(shoulderCenterX, shoulderCenterY, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color)
            this.AddLine(shoulderCenterX, shoulderCenterY, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color)
        }
        this.AddLine(bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        // Connect the hips
        this.AddLine(bodyPosition.leftHip.x, bodyPosition.leftHip.y, bodyPosition.rightHip.x, bodyPosition.rightHip.y, color);
        // Shoulders to center of hips
        // Usually we rely on AddLine filtering out occluded / 0,0 values but the average will break that so check here
        if ((bodyPosition.leftHip.x * bodyPosition.leftHip.y * bodyPosition.rightHip.x * bodyPosition.rightHip.y) > 0) {
            let hipCenterX: number = (bodyPosition.leftHip.x + bodyPosition.rightHip.x) / 2
            let hipCenterY: number = (bodyPosition.leftHip.y + bodyPosition.rightHip.y) / 2
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color)
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color)
        }
    }

    public static AddLine(x1: number, y1: number, x2: number, y2: number, color: Color) {
        // Only add the line if no points are at 0
        if ((x1 * y1 * x2 * y2) > 0) {
            let line = { start: [x1, y1], end: [x2, y2], color: color }
            this.lines.push(line)
        }
    }

    public static AddHolds(route: Route) {
        console.log(`Adding holds`)
        let holdColor: Color = { red: 0.8, green: 0.2, blue: 0.8, alpha: 0.8 }
        for (let holdPosition of route.holds) {
            console.log(`Adding hold at [${holdPosition.x}, ${holdPosition.y}] with radius ${holdPosition.radius}`)
            this.AddHold(holdPosition.x, holdPosition.y, holdPosition.radius, holdColor)
        }
    }

    public static AddHold(centerX: number, centerY: number, radius: number, color: Color) {
        let hold: Hold = { center: [centerX, centerY], radius: radius, color: color, name: "hold" }
        this.holds.push(hold)
    }

    public static RenderFacets(height: number, width: number, offsetX: number, offsetY: number) {
        return this.lines.map(l => {
            // Scaled to screen

            let x1 = l.start[0] / width + offsetX
            let y1 = l.start[1] / height + offsetY
            let x2 = l.end[0] / width + offsetX
            let y2 = l.end[1] / height + offsetY

            /*
            let x1 = l.start[0]
            let y1 = l.start[1]
            let x2 = l.end[0]
            let y2 = l.end[1]  
            */
            let lineWidth = 8 / width
            let p3 = [x1, y1] as Point
            let p2 = [x2 - lineWidth, y2 + lineWidth] as Point
            let p1 = [x2 + lineWidth, y2 - lineWidth] as Point
            let facet = [[p1[0], p1[1]], [p2[0], p2[1]], [p3[0], p3[1]]]

            return {
                // In a draw call, we can pass the shader source code to regl
                frag: `
                        precision mediump float;
                        uniform vec4 color;
                        void main () {
                          gl_FragColor = color;
                        }`,

                vert: `
                        precision mediump float;
                        attribute vec2 position;
                        void main () {
                          gl_Position = vec4(position, 0, 1);
                        }`,

                attributes: {
                    position: facet
                },

                uniforms: {
                    color: [l.color.red, l.color.green, l.color.blue, l.color.alpha]
                },

                count: 3
            }
        }
        )
    }

    public static RenderHolds(height: number, width: number, offsetX: number, offsetY: number) {
        return this.holds.map(h => {
            // Scaled to screen

            let x = h.center[0] / width + offsetX
            let y = h.center[1] / height + offsetY
            let r = h.radius * (0.05 / 10)
            //console.log(`Putting hold at ${x}, ${y}, ${r}`)

            return {
                // In a draw call, we can pass the shader source code to regl
                frag: `
                        precision mediump float;
                        uniform vec4 color;
                        void main () {
                          gl_FragColor = color;
                        }`,

                vert: `
                        precision mediump float;
                        attribute vec2 position;

                        uniform float pointWidth;
                        uniform float stageWidth;
                        uniform float stageHeight;

                        // helper function to transform from pixel space to normalized
                        // device coordinates (NDC). In NDC (0,0) is the middle,
                        // (-1, 1) is the top left and (1, -1) is the bottom right.
                        vec2 normalizeCoords(vec2 position) {
                            // read in the positions into x and y vars
                            float x = position[0];
                            float y = position[1];

                            return vec2(
                                2.0 * ((x / stageWidth) - 0.5),
                                // invert y to treat [0,0] as bottom left in pixel space
                                -(2.0 * ((y / stageHeight) - 0.5)));
                        }

                        void main () {
                          gl_Position = vec4(normalizeCoords(position), 0, 1);
                        }`,

                attributes: {
                    position: [
                        [x - r, y - r],
                        [x + r, y - r],
                        [x + r, y + r],
                        [x - r, y + r]
                    ]
                },

                uniforms: {
                    color: [0.6, 0.2, 0.6, 0.5],
                    pointWidth: 1.0,
                    stageWidth: width,
                    stageHeight: height
                },

                count: 4,

                primitive: "line loop"
            }
        }
        )
    }

    public static RenderCorners(height: number, width: number, offsetX: number, offsetY: number) {
        return {
            // In a draw call, we can pass the shader source code to regl
            frag: `
                        precision mediump float;
                        uniform vec4 color;
                        void main () {
                          gl_FragColor = color;
                        }`,

            vert: `
                        precision mediump float;
                        attribute vec2 position;

                        uniform float pointWidth;

                        void main () {
                          gl_Position = vec4(position, 0, 1);
                        }`,

            attributes: {
                position: [
                    [-1.0, -1.0],
                    [1.0, -1.0],
                    [1.0, 1.0],
                    [-1.0, 1.0]
                ]
            },

            uniforms: {
                color: [1.0, 1.0, 1.0, 0.5],
                pointWidth: 1.0
            },

            count: 4,

            primitive: "line loop"
        }
    }

}