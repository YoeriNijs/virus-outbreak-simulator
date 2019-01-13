import {Doctor} from "./doctor";
import {Person} from "./person";

export class Patient extends Person {

  private currentInfectionCycle = 0;
  private healthy;

  constructor(public position: number[],
              private cyclesBeforeDeath: number,
              private infected: boolean) {
    super(position);
    this.healthy = !infected;
  }

  public infectByPatient(patient: Patient): void {
    this.healthy = !patient.isInfected();
  }

  public isInfected(): boolean {
    return !this.healthy;
  }

  public cureByDoctor(doctor: Doctor): void {
    this.healthy = doctor.curePatient();
    this.currentInfectionCycle = 0;
  }

  public countInfectionCycle(): void {
    this.currentInfectionCycle++;
  }

  public isPassedAway(): boolean {
    return this.currentInfectionCycle >= this.cyclesBeforeDeath;
  }
}