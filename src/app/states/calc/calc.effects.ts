import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, of, tap, EMPTY, filter, withLatestFrom } from 'rxjs';
import { VolumeUnit, StopwatchStatus } from 'src/app/data-models/enum';
import * as fromRoot from 'src/app/states';
import * as fromCalc from 'src/app/states/calc/calc.reducer';
import * as CalcActions from './calc.actions';

@Injectable()
export class CalcEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => of(
        CalcActions.restoreRatio(),
        CalcActions.restoreTotalBrew(),
        CalcActions.restoreStopwatch()
      ))
    )
  );

  restoreRatio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreRatio),
      switchMap(() => {
        const ratio = Number(localStorage.getItem('cr-ratio'));

        if (!ratio || Number.isNaN(ratio)) {
          return EMPTY;
        }
        return of(CalcActions.restoreRatioSuccess({ ratio }));
      })
    )
  );

  restoreTotalBrew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreTotalBrew),
      switchMap(() => {
        const brew = Number(localStorage.getItem('cr-brew'));
        const unit = localStorage.getItem('cr-brew-unit') as VolumeUnit;

        if (
          !brew ||
          Number.isNaN(brew) ||
          !unit
        ) {
          return EMPTY;
        }
        return of(CalcActions.restoreTotalBrewSuccess({ brew, unit }));
      })
    )
  );

  restoreStopwatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreStopwatch),
      switchMap(() => {
        const status = Number(localStorage.getItem('cr-stopwatch-status'));
        const startTime = Number(localStorage.getItem('cr-stopwatch-starttime'));
        const lastTime = Number(localStorage.getItem('cr-stopwatch-lasttime'));

        if (
          !status ||
          Number.isNaN(status) ||
          !startTime ||
          Number.isNaN(startTime) ||
          !lastTime ||
          Number.isNaN(lastTime)
        ) {
          return EMPTY;
        }
        return of(CalcActions.restoreStopwatchSuccess({
          status: status as StopwatchStatus,
          startTime,
          lastTime
        }));
      })
    )
  );

  restoreStopwatchSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreStopwatchSuccess),
      tap(({ status }) => {
        if (status === StopwatchStatus.Running) {
          this.intervalId = window.setInterval(() => {
            this.store$.dispatch(CalcActions.tickStopwatch({ now: Date.now() }));
          }, 100);
        }
      })
    ),
  { dispatch: false }
  );

  updateRatio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.updateRatio),
      filter(({ ratio }) => ratio > 2),
      tap(({ ratio }) => localStorage.setItem('cr-ratio', ratio.toString()))
    ),
  { dispatch: false }
  );

  updateTotalBrew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.updateTotalBrew),
      filter(({ brew }) => brew > 0),
      tap(({ brew }) => localStorage.setItem('cr-brew', brew.toString()))
    ),
  { dispatch: false }
  );

  updateTotalBrewUnit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.updateTotalBrewUnit),
      withLatestFrom(this.store$.select(fromCalc.getTotalBrew)),
      tap(([{ unit }, brew]) => {
        localStorage.setItem('cr-brew', brew.toString());
        localStorage.setItem('cr-brew-unit', unit.toString());
      })
    ),
  { dispatch: false }
  );

  toggleStopwatchRun$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.toggleStopwatchRun),
      withLatestFrom(
        this.store$.select(fromCalc.getStopwatchStatus),
        this.store$.select(fromCalc.getStopwatchStartTime)
      ),
      tap(([, status, startTime]) => {
        localStorage.setItem('cr-stopwatch-status', status.toString());

        switch (status) {
          case StopwatchStatus.Running:
            localStorage.setItem('cr-stopwatch-starttime', startTime.toString());
            this.intervalId = window.setInterval(() => {
              this.store$.dispatch(CalcActions.tickStopwatch({ now: Date.now() }));
            }, 100);
            break;
          case StopwatchStatus.Paused:
            clearInterval(this.intervalId);
            break;
          default:
            break;
        }
      })
    ),
  { dispatch: false }
  );

  tickStopwatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.tickStopwatch),
      withLatestFrom(this.store$.select(fromCalc.getStopwatchDuration)),
      switchMap(([{ now }, duration]) => {
        localStorage.setItem('cr-stopwatch-lasttime', now.toString());
        const oneHourInSec = 3600;

        if (duration >= oneHourInSec) {
          return of(CalcActions.resetStopwatch());
        }
        return EMPTY;
      })
    )
  );

  resetStopwatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.resetStopwatch),
      tap(() => {
        clearInterval(this.intervalId);
        const now = Date.now().toString();

        localStorage.setItem('cr-stopwatch-status', StopwatchStatus.NotStarted.toString());
        localStorage.setItem('cr-stopwatch-starttime', now);
        localStorage.setItem('cr-stopwatch-lasttime', now);
      })
    ),
  { dispatch: false }
  );

  private intervalId = 0;

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>
  ) { }
}
