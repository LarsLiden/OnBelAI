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
export const HEIGHT = 1920
export const WIDTH = 1020 

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
    canvas.setAttribute("style", `width:${SCALE * WIDTH}px; height: ${SCALE *HEIGHT}px; background-color: black; background-position: center; display:block; background-repeat: no-repeat; background-size: contain; background-image: url(${String(route2background)});`);

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
      let height = -HEIGHT / 2
      let offsetX = -1
      let offsetY = 1

      document.querySelector("#suggestion1").innerHTML = RenderSet.suggestions[0] ? RenderSet.suggestions[0] : "None"
    
      if (RenderSet.suggestions[1]) {
        document.querySelector("#suggestion2").innerHTML = RenderSet.suggestions[1]
        document.querySelector("#suggestion2").setAttribute("style", `visibility:visible`)
      }
      else {
        document.querySelector("#suggestion2").setAttribute("style", `visibility:hidden`)
      }

      if (RenderSet.suggestions[2]) {
        document.querySelector("#suggestion3").innerHTML = RenderSet.suggestions[1]
        document.querySelector("#suggestion3").setAttribute("style", `visibility:visible`)
      }
      else {
        document.querySelector("#suggestion3").setAttribute("style", `visibility:hidden`)
      }

      // Width and height seem to be screen size
      //console.log(`Context width: ${width}, height: ${height}`)

      for (let facet of RenderSet.RenderFacets(height, width, offsetX, offsetY)) {
        //console.log(facet);
        reglObj(facet)();
      }
      /*
      for (let hold of RenderSet.RenderHolds(height, width, offsetX, offsetY)) {
        //console.log(facet);
        reglObj(hold)();
      }
      */
    });

  }
  
  render() {
    return (
      <div>
        <div className="Suggestion" id="suggestion1">1</div>
        <div className="Suggestion Position2" id="suggestion2">2</div>
        <div className="Suggestion Position3" id="suggestion3">3</div>
        <div className="Canvas" id="reglTest"></div>
      </div>
    )
  }
}

export default App;
