import { BodyPosition, Color } from "./models";


export interface Point {
    [index: number]: number;
}

export interface Line {
    start: Point,
    end: Point
}

export interface Facet {
    [index: number]: Point
}

export class RenderSet {


    static lines : Array<Line> = []

    public static AddBodyPosition(bodyPosition: BodyPosition, color: Color) {
        // Line from hand to elbow to shoulder
        this.AddLine(bodyPosition.leftHand.x, bodyPosition.leftHand.y, bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, color)
        this.AddLine(bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color);
        // Right hand to elbow to shoulder
        this.AddLine(bodyPosition.rightHand.x, bodyPosition.rightHand.y, bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, color);
        this.AddLine(bodyPosition.rightElbow.x, bodyPosition.rightElbow.y, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        // Left leg, foot to knee to hip
        this.AddLine(bodyPosition.leftFoot.x, bodyPosition.leftFoot.y, bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, color);
        this.AddLine(bodyPosition.leftKnee.x, bodyPosition.leftKnee.y, bodyPosition.leftHip.x, bodyPosition.leftHip.y, color);
    ``  // Right leg, foot to knee to hip
        this.AddLine(bodyPosition.rightFoot.x, bodyPosition.rightFoot.y, bodyPosition.rightKnee.x, bodyPosition.rightKnee.y, color);
        this.AddLine(bodyPosition.rightKnee.x, bodyPosition.rightKnee.y, bodyPosition.rightHip.x, bodyPosition.rightHip.y, color);
        // Connect the shoulders
        this.AddLine(bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        // Connect the hips
        this.AddLine(bodyPosition.leftHip.x, bodyPosition.leftHip.y, bodyPosition.rightHip.x, bodyPosition.rightHip.y, color);
        // Shoulders to center of hips
        // Usually we rely on AddLine filtering out occluded / 0,0 values but the average will break that so check here
        if ((bodyPosition.leftHip.x * bodyPosition.leftHip.y * bodyPosition.rightHip.x * bodyPosition.rightHip.y) > 0) {
            let hipCenterX: number = (bodyPosition.leftHip.x) + (bodyPosition.rightHip.x) /2
            let hipCenterY: number = (bodyPosition.rightHip.y) + (bodyPosition.rightHip.y) / 2
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color)
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color) 
        }      
    }

    public static AddLine(x1: number, y1: number, x2:number, y2: number, color: Color) {
        if ((x1 * y1 * x2 * y2) == 0) {
            // One of the coordinates was 0
            return
        }
        let line = {start: [x1, y1], end: [x2, y2], color: color}
        this.lines.push(line)
    }

    public static RenderFacets(height: number, width: number, color: Color) {
        return this.lines.map(l =>
            {
                // Scaled to screen
                let x1 = l.start[0]/width
                let y1 = l.start[1]/height
                let x2 = l.start[0]/width
                let y2 = l.start[1]/height

                let p3 = [x1, y1] as Point
                let p2 = [x2-0.2, y2+0.2] as Point
                let p1 = [x2+0.2, y2-0.2] as Point
                let facet = [[p1[0], p1[1]],[p2[0], p2[1]],[p3[0], p3[1]]]

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
                          color: [color.red, color.green, color.blue, color.alpha]
                        },
                      
                        count: 3
                    }
                }
            )
    }
}