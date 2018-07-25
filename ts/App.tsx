/* eslint-disable import/first */
import * as React from 'react';
import regl from 'regl';
import { Component } from 'react';
import { RenderSet } from './RenderSet'
import { Positioner } from './positioner'
import { Color } from './models'
//import logo from './'  // './logo.svg';
// Background image
let route2background = require('./data/route2-background.png');
import './App.css';

let positioner = new Positioner()

positioner.Run()

export const SCALE = 0.5
export const HEIGHT = 1920 * SCALE
export const WIDTH = 1920 * SCALE

class App extends Component {

  componentDidMount() {
    const rootDiv = document.getElementById('reglTest');
    console.log(rootDiv);

    var reglObj = regl({
      container: rootDiv,
    })

   // let width = context.drawingBufferWidth
   // let height = context.drawingBufferHeight

    const canvas = document.querySelector("#reglTest > canvas:first-of-type");
    canvas.setAttribute("style", `width:${WIDTH}px; height: ${HEIGHT}px; background-color: black; background-position: center; display:block; background-repeat: no-repeat; background-size: contain; background-image: url(${String(route2background)});`);

    var lineWidth = 1
    reglObj.clear({
      color: [0,0,0,0],//[(tick % 100 * 0.01), 0, 0, 1],
      depth: 1
    });

    reglObj.frame((context:any) => {
      // context.tick
      
      reglObj.clear({
        color: [0,0,0,0],//[(tick % 100 * 0.01), 0, 0, 1],
        depth: 1
      });
      

      //let width = context.drawingBufferWidth
      //let height = context.drawingBufferHeight
      let width = WIDTH / 2
      let height = HEIGHT / 2
      let offsetX = -1
      let offsetY = -1

      // Width and height seem to be screen size
      //console.log(`Context width: ${width}, height: ${height}`)

      for (let facet of RenderSet.RenderFacets(height, width, offsetX, offsetY)) {
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

  }
  
  render() {
    return ( <div className="Canvas" id="reglTest">  </div> );
  }
}

export default App;
