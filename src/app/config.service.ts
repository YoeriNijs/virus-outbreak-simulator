import { Injectable } from '@angular/core';
import {SliderComponent} from "./slider/slider.component";
import {SliderType} from "./slider/slider-type";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private sliders: SliderComponent[] = [];

  register(slider: SliderComponent) {
    if(this.isRegistered(slider)) {
      console.warn(`There is already a slider with type ${slider.type} registered!`);
      return;
    }
    
    this.sliders.push(slider);
    console.log(`Registered slider with type ${slider.type}`);
  }

  disableSliders(): void {
    this.sliders.forEach(s => s.disable());;
  }

  resetSliders(): void {
    this.sliders.forEach(s => s.reset());
  }

  getSliderByType(type: SliderType) {
    return this.sliders.find(s => s.type === type);
  }

  private isRegistered(slider: SliderComponent): boolean {
    return this.sliders.filter(s => s.type === slider.type).length > 0;
  }
}
