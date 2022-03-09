import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromCalc from './calc/calc.reducer';


export interface State {

  [fromCalc.calcFeatureKey]: fromCalc.CalcState;
}

export const reducers: ActionReducerMap<State> = {

  [fromCalc.calcFeatureKey]: fromCalc.reducer,
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
