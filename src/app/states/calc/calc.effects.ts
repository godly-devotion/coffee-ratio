import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { switchMap, of, tap, EMPTY, filter } from 'rxjs';
import * as CalcActions from './calc.actions';

@Injectable()
export class CalcEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => of(
        CalcActions.restoreRatio(),
        CalcActions.restoreTotalBrew()
      ))
    )
  );

  restoreRatio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreRatio),
      switchMap(() => {
        const storageVal = localStorage.getItem('cr-ratio');

        if (storageVal) {
          return of(CalcActions.restoreRatioSuccess({ ratio: Number(storageVal) }));
        }
        return EMPTY;
      })
    )
  );

  updateRatio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.updateRatio),
      filter(({ ratio }) => ratio > 0),
      tap(({ ratio }) => localStorage.setItem('cr-ratio', ratio.toString()))
    ),
    { dispatch: false }
  );

  restoreTotalBrew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restoreTotalBrew),
      switchMap(() => {
        const storageVal = localStorage.getItem('cr-total-brew');

        if (storageVal) {
          return of(CalcActions.restoreTotalBrewSuccess({ brew: Number(storageVal) }));
        }
        return EMPTY;
      })
    )
  );

  updateTotalBrew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.updateTotalBrew),
      filter(({ brew }) => brew > 0),
      tap(({ brew }) => localStorage.setItem('cr-total-brew', brew.toString()))
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions) { }
}
