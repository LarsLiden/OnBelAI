/* eslint-disable import/first */
import * as React from 'react';
import regl from 'regl';
import { Component } from 'react';
//import logo from './'  // './logo.svg';
import './App.css';

class App extends Component {

  componentDidMount() {
    const rootDiv = document.getElementById('reglTest');
    console.log(rootDiv);

    var reglObj = regl({
      container: rootDiv,
    })

    const canvas = document.querySelector("#reglTest > canvas:first-of-type");
    canvas.setAttribute("style", "display:block;");

    reglObj.frame(({tick}:any) => {
      reglObj.clear({
        color: [(tick % 100 * 0.01), 0, 0, 1],
        depth: 1,
      });

      reglObj({
        frag: `void main() {
          gl_FragColor = vec4(1, 0, 0, 1);
        }`,
        vert: `attribute vec2 position;
          void main() {
            gl_Position = vec4(position, 0, 1);
          }`,
        attributes: {
          position: [
            [(tick % 100 * 0.01), -1],
            [-1, 0],
            [1, 1]
          ]
        },
        count: 3
      })()
    });

  }
  render() {
    return ( <div id = "reglTest" >  </div> );
  }
}

export default App;
