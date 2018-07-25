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
import { RenderSet } from './RenderSet';
import { Positioner } from './positioner';
//import logo from './'  // './logo.svg';
import './App.css';
var positioner = new Positioner();
positioner.Run();
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.componentDidMount = function () {
        var rootDiv = document.getElementById('reglTest');
        console.log(rootDiv);
        var reglObj = regl();
        var lineWidth = 1;
        reglObj.frame(function (context) {
            // context.tick
            reglObj.clear({
                color: 0,
                depth: 1,
            });
            var width = context.drawingBufferWidth;
            var height = context.drawingBufferHeight;
            for (var _i = 0, _a = RenderSet.RenderFacets(height, width); _i < _a.length; _i++) {
                var facet = _a[_i];
                reglObj(facet)();
            }
            /*
            reglObj({
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
                    [-1, 0],
                    [0, -1],
                    [1, 1]
                  ]
                },
              
                uniforms: {
                  color: [1, 0, 0, 1]
                },
              
                count: 3
              })()*/
        });
    };
    App.prototype.render = function () {
        return (React.createElement("div", { className: "Canvas", id: "reglTest" }, "  "));
    };
    return App;
}(Component));
export default App;
//# sourceMappingURL=App.js.map