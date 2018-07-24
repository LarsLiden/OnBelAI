var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* eslint-disable import/first */
import * as React from 'react';
import regl from 'regl';
import { Component } from 'react';
//import logo from './'  // './logo.svg';
import './App.css';
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.componentDidMount = function () {
        var rootDiv = document.getElementById('reglTest');
        console.log(rootDiv);
        var reglObj = regl({
            container: rootDiv,
        });
        var canvas = document.querySelector("#reglTest > canvas:first-of-type");
        canvas.setAttribute("style", "display:block;");
        reglObj.frame(function (_a) {
            var tick = _a.tick;
            reglObj.clear({
                color: [(tick % 100 * 0.01), 0, 0, 1],
                depth: 1,
            });
            reglObj({
                frag: "void main() {\n          gl_FragColor = vec4(1, 0, 0, 1);\n        }",
                vert: "attribute vec2 position;\n          void main() {\n            gl_Position = vec4(position, 0, 1);\n          }",
                attributes: {
                    position: [
                        [(tick % 100 * 0.01), -1],
                        [-1, 0],
                        [1, 1]
                    ]
                },
                count: 3
            })();
        });
    };
    App.prototype.render = function () {
        return (React.createElement("div", { id: "reglTest" }, "  "));
    };
    return App;
}(Component));
export default App;
//# sourceMappingURL=App.js.map