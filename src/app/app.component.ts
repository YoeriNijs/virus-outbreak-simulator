import { Component } from '@angular/core';
import { ConfigService } from "./config.service";
import { State } from './app-state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentState: State;

  constructor(private config: ConfigService) {
    this.currentState = 'undefined';
  }

  start() {
    this.config.disableSliders();
    this.currentState = 'start';
  }

  reset() {
    this.config.resetSliders();
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
