import { BodyPosition, Color } from "./models";
import regl from 'regl';

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
    public static backgroundImage: any = null;

    public static LoadBackroundImage() {
        return new Promise((resolve, reject) => {
            var image = new Image()
            image.src = 'https://www.dropbox.com/s/xwft920mqn5j9m7/RouteHolds2.png'
            image.onload = () => {
                this.backgroundImage = image;
                resolve(this.backgroundImage)
            }
            image.onerror = reject
        })
    }

    public static RenderBackground() {
        return {
            frag: `
            precision mediump float;
            uniform sampler2D texture;
            varying vec2 uv;
            void main () {
              gl_FragColor = texture2D(texture, uv);
            }`,
          
            vert: `
            precision mediump float;
            attribute vec2 position;
            varying vec2 uv;
            void main () {
              uv = position;
              gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
            }`,
          
            attributes: {
              position: [
                -2, 0,
                0, -2,
                2, 2]
            },
          
            uniforms: {
              texture: regl.texture(this.backgroundImage)
            },
          
            count: 3
          }
    }
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
        // Right leg, foot to knee to hip
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
        // Only add the line if no points are at 0
        if ((x1 * y1 * x2 * y2) > 0) {
            let line = {start: [x1, y1], end: [x2, y2], color: color}
            this.lines.push(line)
        }
    }

    public static RenderFacets(height: number, width: number, offsetX: number, offsetY: number, color: Color) {
        return this.lines.map(l =>
            {
                // Scaled to screen
                
                let x1 = l.start[0]/width + offsetX
                let y1 = l.start[1]/height + offsetY
                let x2 = l.end[0]/width + offsetX
                let y2 = l.end[1]/height + offsetY
                
               /*
               let x1 = l.start[0]
               let y1 = l.start[1]
               let x2 = l.end[0]
               let y2 = l.end[1]  
               */            

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