import { createAction, props } from '@ngrx/store';
import { StopwatchStatus } from 'src/app/data-models/enum';

export const restore = createAction('[Stopwatch] Restore');
export const restoreSuccess = createAction(
  '[Stopwatch] Restore Success',
  props<{ status: StopwatchStatus; startTime: number; lastTime: number }>(),
);

export const toggleRun = createAction('[Stopwatch] Toggle Run');
export const tick = createAction('[Stopwatch] Tick', props<{ now: number }>());
export const reset = createAction('[Stopwatch] Reset');
