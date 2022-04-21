import { createAction, props } from '@ngrx/store';
import { VolumeUnit } from 'src/app/data-models/enum';

export const restorePreferences = createAction(
  '[Calc] Restore Preferences'
);
export const restorePreferencesSuccess = createAction(
  '[Calc] Restore Preferences Success',
  props<{
    waterRatio: number;
    useBlendRatio: boolean;
    blendRatio: number;
    brew: number;
    unit: VolumeUnit;
  }>()
);
export const restorePreferencesFailure = createAction(
  '[Calc] Restore Preferences Failure'
);

export const updateWaterRatio = createAction(
  '[Calc] Update Water Ratio',
  props<{ waterRatio: number }>()
);
export const toggleBlendRatioUse = createAction(
  '[Calc] Toggle Blend Ratio Use'
);
export const updateBlendRatio = createAction(
  '[Calc] Update Blend Ratio',
  props<{ blendRatio: number }>()
);
export const updateTotalBrew = createAction(
  '[Calc] Update Total Brew',
  props<{ brew: number }>()
);
export const updateTotalBrewUnit = createAction(
  '[Calc] Update Total Brew Unit',
  props<{ unit: VolumeUnit }>()
);
