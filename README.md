# Virus Outbreak Simulator in Angular

Just for fun, I created a virus outbreak simulator in Angular. The simulation holds three types of persons:

  - Patients: just the random people. They will not die soon by a deadly virus;
  - Infected patients: the really sick people, infected by a deadly virus;
  - Doctors: they can cure infected patients.

In order to infect or cure patients, the infected patients or the doctors respectively should have the same position as another patient. In other words: they should be able to touch each other.  

As God, you can play with some initial parameters, such as:
  - The number of doctors;
  - The number of patients;
  - The number of infected patients;
  - The chance of being infected (i.e. infectiousness);
  - The number of cycles (i.e. moves) before an infectied patient dies. 