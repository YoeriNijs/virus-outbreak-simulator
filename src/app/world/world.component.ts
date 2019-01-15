import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {ConfigService} from "../config.service";
import {Patient} from "./models/patient";
import {Doctor} from "./models/doctor";
import {State} from "../app-state";
import {Person} from "./models/person";
import {BrainsService} from "../brains.service";

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnChanges {
  @Input() state: State;
  @Input() autoRestart: boolean;
  @Input() currentPrediction = 0;
  @Output() stateChange = new EventEmitter<State>();

  infectiousness: number;

  positions = [];
  persons: any[] = [];
  deceased: Patient[] = [];

  private infectionInterval;
  private cured: number = 0;
  private infectionCycle: number = 0;
  private maxWorldRows = 25;

  constructor(private config: ConfigService, private brains: BrainsService) {}

  ngOnChanges(): void {
    switch(this.state) {
      case 'undefined':
        console.info('The world is undefined. Play for God and click start...');
        break;
      case 'start':
        this.startWorld();
        break;
      case 'restart':
        this.resetWorld();
        this.startWorld();
        break;
      case 'stop':
        clearInterval(this.infectionInterval);
        break;
      case 'reset':
        this.resetWorld();
        break;
      default:
        console.error(`The world is totally lost since the following state is unknown: ${this.state}`);
    }
  }

  getNumberInfected(): number {
    return this.persons.filter(p => p instanceof Patient && p.isInfected()).length;
  }

  getNumberDeath(): number {
    return this.deceased.filter(p => p instanceof Patient && p.isPassedAway()).length;
  }

  getNumberOfCured(): number {
    return this.cured;
  }

  getCycle(): number {
    return this.infectionCycle;
  }

  private startWorld(): void {
    this.infectiousness = this.config.getSliderByType('infectiousness').value;

    this.createWorld();
    this.createPersons();

    // The actual simulation loop
    this.infectionInterval = setInterval(() => {
      console.log(`Cycle ${this.infectionCycle++}`);

      this.persons.forEach(person => this.doMove(person));

      if(this.shouldStopWorld()) {
        this.stopWorld();
      }
    }, 100)
  }

  private stopWorld(): void {
    // Stop simulation
    console.info('Stop the world from spinning...');
    clearInterval(this.infectionInterval);

    if(this.autoRestart) {
      console.log('Restart since auto restart is enabled');
      this.stateChange.emit('restart');
    } else {
      this.stateChange.emit('stop');
    }

    // Report result
    const result = `Simulation result: ${this.deceased.length} patients deceased after ${this.infectionCycle} cycles 
    (expected=${this.currentPrediction}) with ${this.infectiousness}% virus infectiousness.`;
    if(this.autoRestart) {
      console.log(result);
    } else {
      alert(result);
    }

    // Remember output for prediction purposes
    this.brains.train(this.deceased.length);
  }

  private createWorld(): void {
    for(let i = 0; i < this.maxWorldRows; i++) {
      let arr: number[] = [];
      for(let i = 0; i < this.maxWorldRows; i++) {
        arr.push(i);
      }
      this.positions.push(arr);
    }
  }

  private resetWorld(): void {
    this.positions = [];
    this.persons = [];
    this.deceased = [];
    this.cured = 0;
    this.infectionCycle = 0;
  }

  private doMove(currentPerson: Patient | Doctor): void {
    if(currentPerson instanceof Patient) {
      this.doMovePatient(currentPerson);
    } else {
      this.doMoveDoctor(currentPerson);
    }
  }

  private doMovePatient(patient: Patient): void {
    patient.countInfectionCycle();
    if(patient.isPassedAway()) {
      this.markAsPassedAway(patient);
      return;
    }

    const newStep = patient.step();
    const personOnPosition = this.getPersonOnPosition(newStep);
    if(personOnPosition === null) {
      patient.setPosition(newStep);
      return;
    }

    if (personOnPosition instanceof Patient && personOnPosition.isInfected()) {
      const shouldInfect = Math.random() >= this.infectiousness / 10;
      if(shouldInfect) {
        patient.infectByPatient(personOnPosition);
      }
    }

    const anotherNewStep = this.determineValidStepFor(patient);
    if(anotherNewStep === null) {
      return; // There is no valid next step, stay on the position;
    }
    patient.setPosition(anotherNewStep);
  }

  private doMoveDoctor(doctor: Doctor): void {
    const newStep = doctor.step();
    const personOnPosition = this.getPersonOnPosition(newStep);
    if(personOnPosition === null) {
      doctor.setPosition(newStep);
      return;
    }

    if(personOnPosition instanceof Patient && personOnPosition.isInfected()) {
      personOnPosition.cureByDoctor(doctor);
      this.cured++;
    }

    const anotherNewStep = this.determineValidStepFor(doctor);
    if(anotherNewStep === null) {
      return; // There is no valid next step, stay on the position;
    }
    doctor.setPosition(anotherNewStep);
  }

  private determineValidStepFor(person: Person): number[] {
    for(let i = 0; i < 20; i++) {
      const step = person.step();
      if(this.getPersonOnPosition(step) === null) {
        return step;
      }
    }
    return null;
  }

  private markAsPassedAway(person: Patient) {
    const index = this.persons.indexOf(person);
    this.persons.splice(index, 1);
    this.deceased.push(person);
  }

  private createPersons(): void {
    this.createPatients();
    this.createDoctors();
  }

  private createPatients(): void {
    const nPatients = this.config.getSliderByType('patients').value;
    const nInfected = this.config.getSliderByType('infected').value;
    const nInfectionCycles = this.config.getSliderByType('cycles').value;

    for(let i = 0; i < nPatients; i++) {
      const position = this.getUniquePosition();
      const infected = i <= nInfected;
      this.persons.push(new Patient(position, nInfectionCycles, infected));
    }
  }

  private createDoctors(): void {
    const nDoctors = this.config.getSliderByType('doctors').value;
    for(let i = 0; i < nDoctors; i++) {
      this.persons.push(new Doctor(this.getUniquePosition()));
    }
  }

  private getUniquePosition(): number[] {
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * this.maxWorldRows);
      y = Math.floor(Math.random() * this.maxWorldRows);
    } while (this.getPersonOnPosition([x, y]) !== null);
    return [x, y];
  }

  private isPatientOnPosition(position: number[]) {
    return this.persons.filter(p => p instanceof Patient
        && this.equalsArray(position, p.position)).length > 0;
  }

  private isDoctorOnPosition(position: number[]) {
    return this.persons.filter(p => p instanceof Doctor
        && this.equalsArray(position, p.position)).length > 0;
  }

  private isPersonOnPositionInfected(position: number[]) {
    return this.persons.filter(p => p instanceof Patient
        && this.equalsArray(position, p.position)
        && p.isInfected()).length > 0;
  }

  private equalsArray(actual: number[], expected: number[]) {
    for(let i = 0; i < expected.length; i++) {
      if(expected[i] !== actual[i]) {
        return false;
      }
    }
    return true;
  }

  private shouldStopWorld() {
    const nInfectedPatients = this.persons.filter(p => p instanceof Patient
        && p.isInfected()).length;
    return nInfectedPatients <= 0 || this.getCycle() === 1000; // 1000 should never happen
  }

  private getPersonOnPosition(position: number[]): Person | Doctor {
    const persons = this.persons.filter(p => p.position[0] === position[0] && p.position[1] === position[1]);
    if(persons.length < 1) {
      return null;
    }
    return persons[0]; // Only return the first person here
  }
}
