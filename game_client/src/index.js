/*
import { WavyCircleEffect } from './three_js.js';
WavyCircleEffect();
*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './game_client';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

//import { ReactThreeCanvas } from './game_canvas';
//import React from 'react';
//import ReactDOM from 'react-dom';
//import './react_three_canvas_style.css';
//
//ReactDOM.render(
//  <ReactThreeCanvas />,
//  document.getElementById('root')
//)
