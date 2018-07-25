var RenderSet = /** @class */ (function () {
    function RenderSet() {
    }
    RenderSet.ClearBodyPositions = function () {
        this.lines = [];
    };
    RenderSet.AddBodyPosition = function (bodyPosition, color) {
        // Line from hand to elbow to shoulder
        this.AddLine(bodyPosition.leftHand.x, bodyPosition.leftHand.y, bodyPosition.leftElbow.x, bodyPosition.leftElbow.y, color);
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
            var hipCenterX = (bodyPosition.leftHip.x) + (bodyPosition.rightHip.x) / 2;
            var hipCenterY = (bodyPosition.rightHip.y) + (bodyPosition.rightHip.y) / 2;
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.leftShoulder.x, bodyPosition.leftShoulder.y, color);
            this.AddLine(hipCenterX, hipCenterY, bodyPosition.rightShoulder.x, bodyPosition.rightShoulder.y, color);
        }
    };
    RenderSet.AddLine = function (x1, y1, x2, y2, color) {
        // Only add the line if no points are at 0
        if ((x1 * y1 * x2 * y2) > 0) {
            var line = { start: [x1, y1], end: [x2, y2], color: color };
            this.lines.push(line);
        }
    };
    RenderSet.RenderFacets = function (height, width, offsetX, offsetY) {
        return this.lines.map(function (l) {
            // Scaled to screen
            var x1 = l.start[0] / width + offsetX;
            var y1 = l.start[1] / height + offsetY;
            var x2 = l.end[0] / width + offsetX;
            var y2 = l.end[1] / height + offsetY;
            /*
            let x1 = l.start[0]
            let y1 = l.start[1]
            let x2 = l.end[0]
            let y2 = l.end[1]
            */
            var lineWidth = 5 / width;
            var p3 = [x1, y1];
            var p2 = [x2 - lineWidth, y2 + lineWidth];
            var p1 = [x2 + lineWidth, y2 - lineWidth];
            var facet = [[p1[0], p1[1]], [p2[0], p2[1]], [p3[0], p3[1]]];
            return {
                // In a draw call, we can pass the shader source code to regl
                frag: "\n                        precision mediump float;\n                        uniform vec4 color;\n                        void main () {\n                          gl_FragColor = color;\n                        }",
                vert: "\n                        precision mediump float;\n                        attribute vec2 position;\n                        void main () {\n                          gl_Position = vec4(position, 0, 1);\n                        }",
                attributes: {
                    position: facet
                },
                uniforms: {
                    color: [l.color.red, l.color.green, l.color.blue, l.color.alpha]
                },
                count: 3
            };
        });
    };
    RenderSet.lines = [];
    return RenderSet;
}());
export { RenderSet };
//# sourceMappingURL=RenderSet.js.map