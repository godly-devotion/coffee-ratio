import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/states';
import * as fromCalc from 'src/app/states/calc/calc.reducer';
import * as fromStopwatch from 'src/app/states/stopwatch/stopwatch.reducer';
import * as CalcActions from 'src/app/states/calc/calc.actions';
import * as StopwatchActions from 'src/app/states/stopwatch/stopwatch.actions';
import { VolumeUnit, StopwatchStatus } from './data-models/enum';
import { CalcComponent } from './calc/calc.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CalcComponent, AsyncPipe],
})
export class AppComponent {
  waterRatio$: Observable<number>;
  useBlendRatio$: Observable<boolean>;
  blendRatio$: Observable<number>;
  totalBrewDisplay$: Observable<number>;
  totalBrewUnit$: Observable<VolumeUnit>;
  grounds$: Observable<number>;
  groundsInOunces$: Observable<number>;
  groundsInML$: Observable<number>;
  groundsInCups$: Observable<number>;
  stopwatchStatus$: Observable<StopwatchStatus>;
  stopwatchDuration$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {
    this.waterRatio$ = store.select(fromCalc.getWaterRatio);
    this.useBlendRatio$ = store.select(fromCalc.getUseBlendRatio);
    this.blendRatio$ = store.select(fromCalc.getBlendRatio);
    this.totalBrewDisplay$ = store.select(fromCalc.getTotalBrewDisplay);
    this.totalBrewUnit$ = store.select(fromCalc.getTotalBrewUnit);
    this.grounds$ = store.select(fromCalc.getGrounds);
    this.groundsInOunces$ = store.select(fromCalc.getGroundsInOunces);
    this.groundsInML$ = store.select(fromCalc.getGroundsInML);
    this.groundsInCups$ = store.select(fromCalc.getGroundsInCups);
    this.stopwatchStatus$ = store.select(fromStopwatch.getStopwatchStatus);
    this.stopwatchDuration$ = store.select(fromStopwatch.getStopwatchDuration);
  }

  updateWaterRatio(waterRatio: number): void {
    this.store.dispatch(CalcActions.updateWaterRatio({ waterRatio }));
  }

  toggleUseBlendRatio(): void {
    this.store.dispatch(CalcActions.toggleBlendRatioUse());
  }

  updateBlendRatio(blendRatio: number): void {
    this.store.dispatch(CalcActions.updateBlendRatio({ blendRatio }));
  }

  updateTotalBrew(brew: number): void {
    this.store.dispatch(CalcActions.updateTotalBrew({ brew }));
  }

  updateTotalBrewUnit(unit: VolumeUnit): void {
    this.store.dispatch(CalcActions.updateTotalBrewUnit({ unit }));
  }

  toggleStopwatchRun(): void {
    this.store.dispatch(StopwatchActions.toggleRun());
  }

  resetStopwatch(): void {
    this.store.dispatch(StopwatchActions.reset());
  }
}
