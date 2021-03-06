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

    public static AddBodyPosition(bodyPosition: BodyPosition, color: Color, onHoldColor: Color) {
        // Line from hand to elbow to shoulder
        this.AddLine(bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, bodyPosition.leftHand.x, bodyPosition.leftHand.y, bodyPosition.leftHand.onHold ? onHoldColor : color)
        this.AddLine(bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color);
        // Right hand to elbow to shoulder
        this.AddLine(bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, bodyPosition.rightHand.x, bodyPosition.rightHand.y, bodyPosition.rightHand.onHold ? onHoldColor : color);
        this.AddLine(bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        // Left leg, foot to knee to hip
        this.AddLine(bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, bodyPosition.leftFoot.x, bodyPosition.leftFoot.y, bodyPosition.leftFoot.onHold ? onHoldColor : color);
        this.AddLine(bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, bodyPosition.leftHip.x, bodyPosition.leftHip.y, color);
        // Right leg, foot to knee to hip
        this.AddLine(bodyPosition.rightKnee.x, bodyPosition.rightKnee.y, bodyPosition.rightFoot.x, bodyPosition.rightFoot.y, bodyPosition.rightFoot.onHold ? onHoldColor : color);
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
        // Clear holds first
        this.holds = []

        console.log(`Adding holds`)
        let holdColor: Color = { red: 0.8, green: 0.8, blue: 1.0, alpha: 0.6 }
        let onHoldColor: Color = { red: 1.0, green: 0.0, blue: 0.0, alpha: 0.8 }
        for (let holdPosition of route.holds) {
            console.log(`Adding hold at [${holdPosition.x}, ${holdPosition.y}] with radius ${holdPosition.radius}`)
            let drawColor = holdPosition.onHold ? onHoldColor : holdColor
            this.AddHold(holdPosition.x, holdPosition.y, holdPosition.radius, drawColor)
        }
    }

    public static AddHold(centerX: number, centerY: number, radius: number, color: Color) {
        let hold: Hold = { center: [centerX, centerY], radius: radius, color: color, name: "hold" }
        this.holds.push(hold)
    }
    public static Angle ( x1: number,  y1: number, x2: number, y2: number) {
        let xdiff = x1 - x2;
        let ydiff = y1 - y2;
        let atan = Math.atan2(ydiff, xdiff);
        return atan;
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
            let angle = this.Angle(x1, y1, x2, y2)
            let lineWidth = 9 / width

            let tx1 = x1 - (Math.sin(angle) * lineWidth);
            let ty1 = y1 + (Math.cos(angle) * lineWidth);

            let tx2 = x2 - (Math.sin(angle) * lineWidth);
            let ty2 = y2 + (Math.cos(angle) * lineWidth);
            
            let tx3 = x2 + (Math.sin(angle) * lineWidth);
            let ty3 = y2 - (Math.cos(angle) * lineWidth);

            let tx4 = x1 + (Math.sin(angle) * lineWidth);
            let ty4 = y1 - (Math.cos(angle) * lineWidth);

            let p1 = [tx1, ty1] as Point
            let p2 = [tx2, ty2] as Point
            let p3 = [tx3, ty3] as Point
            let p4 = [tx4, ty4] as Point
            let facets = [p1, p2, p3, p4]

            return {
                primitive: "triangle fan",

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
                    position: facets
                },

                uniforms: {
                    color: [l.color.red, l.color.green, l.color.blue, l.color.alpha],
                    pointWidth: 8.0
                },

                lineWidth: 1,
                count: 4
            }
        }
        )
    }

    public static RenderHolds(height: number, width: number, offsetX: number, offsetY: number) {
        return this.holds.map(h => {
            // Scaled to screen

            let x = h.center[0] / width + offsetX
            let y = h.center[1] / height + offsetY
            let rx = h.radius * (0.03 / 10)
            let ry = rx * (1080/1920)
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
                        void main () {
                          gl_Position = vec4(position, 0, 1);
                        }`,

                attributes: {
                    position: [
                        [x - rx, y - ry],
                        [x + rx, y - ry],
                        [x + rx, y + ry],
                        [x - rx, y + ry]
                    ]
                },

                uniforms: {
                    color: [h.color.red, h.color.green, h.color.blue, h.color.alpha],
                    pointWidth: 8.0
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
                color: [0.5, 0.5, 1.0, 0.5],
                pointWidth: 1.0
            },

            count: 4,

            primitive: "line loop"
        }
    }

}