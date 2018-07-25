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
var backgroundTexture = null;
positioner.Run();
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
        canvas.setAttribute("style", "display:block; width:1080px; height: 1920px;");
        var lineWidth = 1;
        var lineColor = { red: 0.8, green: 0.8, blue: 0.8, alpha: 0.8 };
        reglObj.clear({
            color: [0, 0, 0, 1],
            depth: 1
        });
        reglObj.frame(function (context) {
            // context.tick
            reglObj.clear({
                color: [0, 0, 0, 1],
                depth: 1
            });
            if (!backgroundTexture && RenderSet.backgroundImage) {
                backgroundTexture = reglObj.texture(RenderSet.backgroundImage);
            }
            if (backgroundTexture) {
                reglObj(RenderSet.RenderBackground());
            }
            //let width = context.drawingBufferWidth
            //let height = context.drawingBufferHeight
            var width = 1080 / 2;
            var height = 1920 / 2;
            var offsetX = -1;
            var offsetY = -1;
            // Width and height seem to be screen size
            //console.log(`Context width: ${width}, height: ${height}`)
            for (var _i = 0, _a = RenderSet.RenderFacets(height, width, offsetX, offsetY, lineColor); _i < _a.length; _i++) {
                var facet = _a[_i];
                //console.log(facet);
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