import {Injectable} from "@angular/core";

@Injectable()
export abstract class Person {

  constructor(public position: number[]) {}

  getPosition(): number[] {
    return this.position;
  }

  setPosition(position: number[]) {
    this.position = position;
  }

  step(): number[] {
    const oldX = this.position[0];
    const newX = Math.round(Math.random()) === 0 ? oldX -1 : oldX + 1;

    const oldY = this.position[1];
    const newY = Math.round(Math.random()) === 0 ? oldY -1 : oldY + 1;

    return [newX, newY];
  }
}