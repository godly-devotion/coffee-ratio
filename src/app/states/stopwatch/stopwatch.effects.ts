import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, of, tap, EMPTY, withLatestFrom } from 'rxjs';
import { StopwatchStatus } from 'src/app/data-models/enum';
import * as fromRoot from 'src/app/states';
import * as fromStopwatch from 'src/app/states/stopwatch/stopwatch.reducer';
import * as StopwatchActions from './stopwatch.actions';

@Injectable()
export class StopwatchEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => of(
        StopwatchActions.restore()
      ))
    )
  );

  restore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StopwatchActions.restore),
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
        return of(StopwatchActions.restoreSuccess({
          status: status as StopwatchStatus,
          startTime,
          lastTime
        }));
      })
    )
  );

  restoreSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StopwatchActions.restoreSuccess),
      tap(({ status }) => {
        if (status === StopwatchStatus.Running) {
          this.intervalId = window.setInterval(() => {
            this.store$.dispatch(StopwatchActions.tick({ now: Date.now() }));
          }, 100);
        }
      })
    ),
  { dispatch: false }
  );

  toggleRun$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StopwatchActions.toggleRun),
      withLatestFrom(
        this.store$.select(fromStopwatch.getStopwatchStatus),
        this.store$.select(fromStopwatch.getStopwatchStartTime)
      ),
      tap(([, status, startTime]) => {
        localStorage.setItem('cr-stopwatch-status', status.toString());

        switch (status) {
          case StopwatchStatus.Running:
            localStorage.setItem('cr-stopwatch-starttime', startTime.toString());
            this.intervalId = window.setInterval(() => {
              this.store$.dispatch(StopwatchActions.tick({ now: Date.now() }));
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

  tick$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StopwatchActions.tick),
      withLatestFrom(this.store$.select(fromStopwatch.getStopwatchDuration)),
      switchMap(([{ now }, duration]) => {
        localStorage.setItem('cr-stopwatch-lasttime', now.toString());
        const oneHourInSec = 3600;

        if (duration >= oneHourInSec) {
          return of(StopwatchActions.reset());
        }
        return EMPTY;
      })
    )
  );

  reset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StopwatchActions.reset),
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
