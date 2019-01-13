import {Person} from "./person";

export class Doctor extends Person {

  curePatient(): boolean {
    return true;
  }

}