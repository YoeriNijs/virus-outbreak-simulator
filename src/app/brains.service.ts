import { Injectable } from '@angular/core';
import {ConfigService} from "./config.service";

/**
 * The 'brains' of this piece of software (i.e. a Naive Bayes classifier).
 * See: https://www.analyticsvidhya.com/blog/2017/09/naive-bayes-explained/
 */
@Injectable({
  providedIn: 'root'
})
export class BrainsService {

  private frequency = [];

  constructor(private configService: ConfigService) {}

  /**
   * This trains the Naive Bayes classifier.
   * @param input
   * @param output
   */
  train(output: number): void {
    const key = this.getInputAsJSON();
    if(!this.frequency || !this.frequency.find(v => v.key === key)) {
      this.frequency.push({key: key, output: [output]});
      return;
    }
    this.frequency.find(v => v.key === key).output.push(output);
    console.log('Trained', key, this.frequency
    );
  }

  /**
   * This actually predicts the output by
   * the Naive Bayes algorithm.
   * @param input
   */
  predict(): number {
    const input = this.getInputAsJSON();
    let highestPrediction = 0;
    let mostLikelyOutputValue = 0;
    for(let possibleValue = 0; possibleValue < this.configService.getMaxAmountOfSlider(); possibleValue++) {
      const likelihood = this.calculateLikelihood(input, possibleValue);
      const priorProbability = this.calculatePriorProbability(input);
      const predictor = this.calculatePredictor(possibleValue);
      const newPrediction = likelihood * priorProbability / predictor;
      if (newPrediction > highestPrediction) {
        highestPrediction = newPrediction;
        mostLikelyOutputValue = possibleValue;
      }
    }
    console.log('Predicted', mostLikelyOutputValue, this.frequency);
    return mostLikelyOutputValue;
  }

  private getInputAsJSON(): string {
    const input = {
      'infectiousness': this.configService.getSliderByType('infectiousness').value,
      'doctors': this.configService.getSliderByType('doctors').value,
      'patients': this.configService.getSliderByType('patients').value,
      'infected': this.configService.getSliderByType('infected').value,
      'cycles': this.configService.getSliderByType('cycles').value
    };
    return JSON.stringify(input);
  }

  /**
   * Calculate the likelihood P(x|c).
   * @param input
   */
  private calculateLikelihood(input: string, possibleValue: number): number {
    const obj = this.frequency.find(v => v.key === input);
    if(!obj || !obj.output) {
      return 0;
    }
    return obj.output.filter(v => v === possibleValue).length / obj.output.length;
  }

  /**
   * Calculate the prior probability of the class P(c).
   * @param input
   */
  private calculatePriorProbability(input: string): number {
    const obj = this.frequency.find(v => v.key === input);
    if(!obj || !obj.output) {
      return 0;
    }
    return obj.output.length / this.frequency.length;
  }

  /**
   * Calculate the prior probability of the predictor P(x).
   * @param possibleOutput
   */
  private calculatePredictor(possibleOutput: number): number {
    let count = 0;
    for(let i = 0; i < this.frequency.length; i++) {
      let obj = this.frequency[i];
      obj.output.forEach(o => {
        if(o === possibleOutput) {
          count++;
        }
      })
    }
    return count;
  }
}
