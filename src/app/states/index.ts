import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as fromCalc from './calc/calc.reducer';
import * as fromStopwatch from './stopwatch/stopwatch.reducer';

export interface State {
  [fromCalc.calcFeatureKey]: fromCalc.CalcState;
  [fromStopwatch.stopwatchFeatureKey]: fromStopwatch.StopwatchState;
}

export const reducers: ActionReducerMap<State> = {
  [fromCalc.calcFeatureKey]: fromCalc.reducer,
  [fromStopwatch.stopwatchFeatureKey]: fromStopwatch.reducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
