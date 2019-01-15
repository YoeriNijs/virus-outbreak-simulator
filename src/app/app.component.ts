import { Component } from '@angular/core';
import { ConfigService } from "./config.service";
import { State } from './app-state';
import {BrainsService} from "./brains.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentState: State;
  currentPrediction = 0;
  autoRestart = false;

  constructor(private config: ConfigService, private brains: BrainsService) {
    this.currentState = 'undefined';
  }

  start() {
    this.config.disableSliders();
    this.currentPrediction = this.brains.predict();
    this.currentState = 'start';
  }

  restart() {
    this.config.disableSliders();
    this.currentPrediction = this.brains.predict();
    this.currentState = 'restart';
  }

  reset() {
    this.config.resetSliders();
    this.currentPrediction = 0;
    this.currentState = 'reset';
  }

  stop() {
    this.currentState = 'stop';
  }

  onStateChange(state: State) {
    switch(state) {
      case 'start':
        this.start();
        break;
      case 'restart':
        this.restart();
        break;
      case 'stop':
        this.stop();
        break;
      case 'reset':
        this.reset();
        break;
      default:
        console.warn(`State ${state} is not implemented yet!`);
    }
  }
}
