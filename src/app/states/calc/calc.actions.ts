import { createAction, props } from '@ngrx/store';

export const restoreRatio = createAction(
  '[Calc] Restore Ratio'
);
export const restoreRatioSuccess = createAction(
  '[Calc] Restore Ratio Success',
  props<{ ratio: number }>()
);

export const restoreTotalBrew = createAction(
  '[Calc] Restore Total Brew'
);
export const restoreTotalBrewSuccess = createAction(
  '[Calc] Restore Total Brew Success',
  props<{ brew: number }>()
);

export const updateRatio = createAction(
  '[Calc] Update Ratio',
  props<{ ratio: number }>()
);

export const updateTotalBrew = createAction(
  '[Calc] Update Total Brew',
  props<{ brew: number }>()
);
