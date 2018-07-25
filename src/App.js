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
// Background image
var route2background = require('./data/route2-background.png');
import './App.css';
var positioner = new Positioner();
positioner.Run();
export var SCALE = 0.5;
export var HEIGHT = 1920;
export var WIDTH = 1020;
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
        // let width = context.drawingBufferWidth
        // let height = context.drawingBufferHeight
        var canvas = document.querySelector("#reglTest > canvas:first-of-type");
        canvas.setAttribute("style", "width:" + SCALE * WIDTH + "px; height: " + SCALE * HEIGHT + "px; background-color: black; background-position: center; display:block; background-repeat: no-repeat; background-size: contain; background-image: url(" + String(route2background) + ");");
        var lineWidth = 1;
        reglObj.clear({
            color: [0, 0, 0, 0],
            depth: 1
        });
        reglObj.frame(function (context) {
            // context.tick
            reglObj.clear({
                color: [0, 0, 0, 0],
                depth: 1
            });
            //let width = context.drawingBufferWidth
            //let height = context.drawingBufferHeight
            var width = WIDTH / 2;
            var height = -HEIGHT / 2;
            var offsetX = -1;
            var offsetY = 1;
            // Width and height seem to be screen size
            //console.log(`Context width: ${width}, height: ${height}`)
            for (var _i = 0, _a = RenderSet.RenderFacets(height, width, offsetX, offsetY); _i < _a.length; _i++) {
                var facet = _a[_i];
                //console.log(facet);
                reglObj(facet)();
            }
        });
    };
    App.prototype.render = function () {
        return (React.createElement("div", { className: "Canvas", id: "reglTest" }, "  "));
    };
    return App;
}(Component));
export default App;
//# sourceMappingURL=App.js.map