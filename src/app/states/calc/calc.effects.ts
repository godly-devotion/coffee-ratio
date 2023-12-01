import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
  ROOT_EFFECTS_INIT,
} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, of, tap, filter, withLatestFrom } from 'rxjs';
import { CalcDefaults } from 'src/app/data-models/calc-defaults';
import { VolumeUnit } from 'src/app/data-models/enum';
import * as fromRoot from 'src/app/states';
import * as fromCalc from 'src/app/states/calc/calc.reducer';
import * as CalcActions from './calc.actions';

@Injectable()
export class CalcEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => of(CalcActions.restorePreferences())),
    ),
  );

  restorePreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalcActions.restorePreferences),
      switchMap(() => {
        const waterRatio = Number(
          localStorage.getItem('cr-water-ratio') ?? CalcDefaults.waterRatio,
        );
        const useBlendRatio =
          localStorage.getItem('cr-use-blend-ratio') === 'true';
        const blendRatio = Number(
          localStorage.getItem('cr-blend-ratio') ?? CalcDefaults.blendRatio,
        );
        const brew = Number(
          localStorage.getItem('cr-brew') ?? CalcDefaults.totalBrew,
        );
        const unit =
          (localStorage.getItem('cr-brew-unit') as VolumeUnit) ??
          CalcDefaults.totalBrewUnit;

        if (
          Number.isNaN(waterRatio) ||
          Number.isNaN(blendRatio) ||
          Number.isNaN(brew) ||
          Number.isNaN(unit)
        ) {
          return of(CalcActions.restorePreferencesFailure());
        }

        return of(
          CalcActions.restorePreferencesSuccess({
            waterRatio,
            useBlendRatio,
            blendRatio,
            brew,
            unit,
          }),
        );
      }),
    ),
  );

  updateWaterRatio$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CalcActions.updateWaterRatio),
        filter(({ waterRatio }) => waterRatio > 0),
        tap(({ waterRatio }) =>
          localStorage.setItem('cr-water-ratio', waterRatio.toString()),
        ),
      ),
    { dispatch: false },
  );

  toggleBlendRatioUse$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CalcActions.toggleBlendRatioUse),
        withLatestFrom(this.store$.select(fromCalc.getUseBlendRatio)),
        tap(([, useBlendRatio]) =>
          localStorage.setItem('cr-use-blend-ratio', useBlendRatio.toString()),
        ),
      ),
    { dispatch: false },
  );

  updateBlendRatio$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CalcActions.updateBlendRatio),
        filter(({ blendRatio }) => blendRatio > 0),
        tap(({ blendRatio }) =>
          localStorage.setItem('cr-blend-ratio', blendRatio.toString()),
        ),
      ),
    { dispatch: false },
  );

  updateTotalBrew$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CalcActions.updateTotalBrew),
        filter(({ brew }) => brew > 0),
        tap(({ brew }) => localStorage.setItem('cr-brew', brew.toString())),
      ),
    { dispatch: false },
  );

  updateTotalBrewUnit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CalcActions.updateTotalBrewUnit),
        withLatestFrom(this.store$.select(fromCalc.getTotalBrew)),
        tap(([{ unit }, brew]) => {
          localStorage.setItem('cr-brew', brew.toString());
          localStorage.setItem('cr-brew-unit', unit.toString());
        }),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>,
  ) {}
}
