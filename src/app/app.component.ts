import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/states';
import * as fromCalc from 'src/app/states/calc/calc.reducer';
import * as CalcActions from 'src/app/states/calc/calc.actions';
import { VolumeUnit, StopwatchStatus } from './data-models/enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  ratio$: Observable<number>;
  totalBrewDisplay$: Observable<number>;
  totalBrewUnit$: Observable<VolumeUnit>;
  grounds$: Observable<number>;
  groundsInOunces$: Observable<number>;
  groundsInML$: Observable<number>;
  groundsInCups$: Observable<number>;
  stopwatchStatus$: Observable<StopwatchStatus>;
  stopwatchDuration$: Observable<number>;

  constructor(
    private store: Store<fromRoot.State>
  ) {
    this.ratio$ = store.select(fromCalc.getRatio);
    this.totalBrewDisplay$ = store.select(fromCalc.getTotalBrewDisplay);
    this.totalBrewUnit$ = store.select(fromCalc.getTotalBrewUnit);
    this.grounds$ = store.select(fromCalc.getGrounds);
    this.groundsInOunces$ = store.select(fromCalc.getGroundsInOunces);
    this.groundsInML$ = store.select(fromCalc.getGroundsInML);
    this.groundsInCups$ = store.select(fromCalc.getGroundsInCups);
    this.stopwatchStatus$ = store.select(fromCalc.getStopwatchStatus);
    this.stopwatchDuration$ = store.select(fromCalc.getStopwatchDuration);
  }

  updateRatio(ratio: number): void {
    this.store.dispatch(CalcActions.updateRatio({ ratio }));
  }

  updateTotalBrew(brew: number): void {
    this.store.dispatch(CalcActions.updateTotalBrew({ brew }));
  }

  updateTotalBrewUnit(unit: VolumeUnit): void {
    this.store.dispatch(CalcActions.updateTotalBrewUnit({ unit }));
  }

  toggleStopwatchRun(): void {
    this.store.dispatch(CalcActions.toggleStopwatchRun());
  }

  resetStopwatch(): void {
    this.store.dispatch(CalcActions.resetStopwatch());
  }
}
