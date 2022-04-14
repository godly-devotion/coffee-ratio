import { createAction, props } from '@ngrx/store';
import { VolumeUnit, StopwatchStatus } from 'src/app/data-models/enum';

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
  props<{ brew: number; unit: VolumeUnit }>()
);

export const restoreStopwatch = createAction(
  '[Calc] Restore Stopwatch'
);
export const restoreStopwatchSuccess = createAction(
  '[Calc] Restore Stopwatch Success',
  props<{ status: StopwatchStatus; startTime: number; lastTime: number }>()
);

export const updateRatio = createAction(
  '[Calc] Update Ratio',
  props<{ ratio: number }>()
);
export const updateTotalBrew = createAction(
  '[Calc] Update Total Brew',
  props<{ brew: number }>()
);
export const updateTotalBrewUnit = createAction(
  '[Calc] Update Total Brew Unit',
  props<{ unit: VolumeUnit }>()
);

export const toggleStopwatchRun = createAction(
  '[Calc] Toggle Stopwatch Run'
);
export const tickStopwatch = createAction(
  '[Calc] Tick Stopwatch',
  props<{ now: number }>()
);
export const resetStopwatch = createAction(
  '[Calc] Reset Stopwatch'
);
