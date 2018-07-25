var RenderSet = /** @class */ (function () {
    function RenderSet() {
    }
    RenderSet.AddBodyPosition = function (bodyPosition) {
        // Line from hand to elbow
        this.AddLine(bodyPosition.leftHand.x, bodyPosition.leftHand.y, bodyPosition.leftElbow.x, bodyPosition.leftElbow.y);
    };
    RenderSet.AddLine = function (x1, y1, x2, y2) {
        var line = { start: [x1, y1], end: [x2, y2] };
        this.lines.push(line);
    };
    RenderSet.RenderFacets = function (height, width) {
        return this.lines.map(function (l) {
            // Scaled to screen
            var x1 = l.start[0] / width;
            var y1 = l.start[1] / height;
            var x2 = l.start[0] / width;
            var y2 = l.start[1] / height;
            var p3 = [x1, y1];
            var p2 = [x2 - 0.2, y2 + 0.2];
            var p1 = [x2 + 0.2, y2 - 0.2];
            var facet = [[p1[0], p1[1]], [p2[0], p2[1]], [p3[0], p3[1]]];
            return {
                // In a draw call, we can pass the shader source code to regl
                frag: "\n                        precision mediump float;\n                        uniform vec4 color;\n                        void main () {\n                          gl_FragColor = color;\n                        }",
                vert: "\n                        precision mediump float;\n                        attribute vec2 position;\n                        void main () {\n                          gl_Position = vec4(position, 0, 1);\n                        }",
                attributes: {
                    position: facet
                },
                uniforms: {
                    color: [1, 0, 0, 1]
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