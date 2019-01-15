import {AfterContentInit, Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ConfigService} from "../config.service";
import {SliderType} from "./slider-type";

const defaultValue = 50;

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, DoCheck {
  @Input() type: SliderType;
  @Input() label: string = 'Unknown';

  max = 0;
  value = defaultValue;

  private disabled = false;

  constructor(private config: ConfigService) {}

  ngOnInit(): void {
    this.config.register(this);
  }

  ngDoCheck(): void {
    this.calcMax();
  }

  change(event) {
    this.value = event.srcElement.value;
  }

  reset() {
    this.disabled = false;
    this.calcValue();
  }

  disable() {
    this.disabled = true;
  }

  isDisabled(): boolean {
    return this.disabled;
  }

  getLabel(): string {
    return this.label.substr(0, 1).toUpperCase() + this.label.substr(1, this.label.length);
  }

  calcMax(): void {
    this.max = this.config.getMaxAmountOfSlider();
    if (this.type === 'infected') {
      const patientSlider = this.config.getSliderByType('patients');
      if (patientSlider) {
        this.max = patientSlider.value;
      }
    }
  }

  calcValue(): void {
    if (this.type === 'infected') {
      // Use the value of the patients slider as max, if there is one
      const patientSlider = this.config.getSliderByType('patients');
      if (patientSlider) {
        this.value = Math.floor(patientSlider.value / 2);
        return;
      }
    } 

    this.value = defaultValue;
  }
}
