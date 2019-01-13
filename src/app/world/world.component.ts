import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {ConfigService} from "../config.service";
import {Patient} from "./models/patient";
import {Doctor} from "./models/doctor";
import {State} from "../app-state";
import {Person} from "./models/person";

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnChanges {
  @Input() state: State;
  @Output() stateChange = new EventEmitter<State>();

  infectiousness: number;

  positions = [];
  persons: any[] = [];
  deceased: Patient[] = [];

  private infectionInterval: number = 0;
  private cured: number = 0;
  private infectionCycle: number = 0;
  private maxWorldRows = 20;

  constructor(private config: ConfigService) {}

  ngOnChanges(): void {
    switch(this.state) {
      case 'undefined':
        console.info('The world is undefined. Play for God and click start...');
        break;
      case 'start':
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
    this.createWorld();
    this.createPersons();

    this.infectiousness = this.config.getSliderByType('infectiousness').value;

    this.infectionInterval = setInterval(() => {
      console.log(`Cycle ${this.infectionCycle++}`);

      this.persons.forEach(person => this.doMove(person));

      if(this.shouldStopWorld()) {
        // Stop simulation
        console.info('Stop the world from spinning...');
        this.stateChange.emit('stop');

        // Display result
        alert(`Simulation result: ${this.deceased.length} patients deceased after ${this.infectionCycle} 
        cycles with a virus with ${this.infectiousness}% infectiousness.`)
      }
    }, 1000)
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
    let step = patient.step();

    patient.countInfectionCycle();
    if(patient.isPassedAway()) {
      this.markAsPassedAway(patient);
      return;
    }

    const personOnPosition = this.getPersonOnPosition(step);
    if (personOnPosition !== null
        && personOnPosition instanceof Patient
        && personOnPosition.isInfected()) {
      const shouldInfect = Math.random() >= this.infectiousness / 10;
      if(shouldInfect) {
        patient.infectByPatient(personOnPosition);
      }
    }

    do {
      step = patient.step();
    } while (this.getPersonOnPosition(step) !== null);

    patient.setPosition(step);
  }

  private doMoveDoctor(doctor: Doctor): void {
    let step = doctor.step();
    const personOnPosition = this.getPersonOnPosition(step);
    if (personOnPosition !== null
        && personOnPosition instanceof Patient
        && personOnPosition.isInfected()) {
      personOnPosition.cureByDoctor(doctor);
      this.cured++;
    }

    do {
      step = doctor.step();
    } while (this.getPersonOnPosition(step) !== null);

    doctor.setPosition(step);
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
        && p.position[0] === position[0]
        && p.position[1] === position[1]).length > 0;
  }

  private isDoctorOnPosition(position: number[]) {
    return this.persons.filter(p => p instanceof Doctor
        && p.position[0] === position[0]
        && p.position[1] === position[1]).length > 0;
  }

  private isPersonOnPositionInfected(position: number[]) {
    return this.persons.filter(p => p instanceof Patient
        && p.position[0] === position[0]
        && p.position[1] === position[1]
        && p.isInfected()).length > 0;
  }

  private shouldStopWorld() {
    const nInfectedPatients = this.persons.filter(p => p instanceof Patient
        && p.isInfected()).length;
    return nInfectedPatients <= 0;
  }

  private getPersonOnPosition(position: number[]): Person | Doctor {
    const persons = this.persons.filter(p => p.position[0] === position[0] && p.position[1] === position[1]);
    if(persons.length < 1) {
      return null;
    }
    return persons[0]; // Only return the first person here
  }
}
