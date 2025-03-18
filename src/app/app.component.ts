import { Component } from '@angular/core';
import { StopwatchComponent } from './stopwatch/stopwatch.component';
import { CalculatorComponent } from './calculator/calculator.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
  `,
  imports: [StopwatchComponent, CalculatorComponent],
})
export class AppComponent {}
