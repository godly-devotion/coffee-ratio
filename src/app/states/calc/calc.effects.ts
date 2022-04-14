import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, of, tap, EMPTY, filter, withLatestFrom } from 'rxjs';
import { VolumeUnit } from 'src/app/data-models/enum';
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
        CalcActions.restoreTotalBrew()
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

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>
  ) { }
}
