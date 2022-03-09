import { createReducer, createSelector, on } from '@ngrx/store';
import { State } from 'src/app/states/index';
import * as CalcActions from 'src/app/states/calc/calc.actions';
import update from 'update-immutable';
import { Utils } from 'src/app/helpers/utils';
import { BrewStrengthColor } from 'src/app/helpers/brew-strength-color';

export const calcFeatureKey = 'calc';

export interface CalcState {
  ratio: number;
  totalBrew: number;
  grounds: number;
}

export const initialState: CalcState = {
  ratio: 16,
  totalBrew: 500,
  grounds: 35.71
};

export const reducer = createReducer(
  initialState,
  on(CalcActions.restoreRatioSuccess, (state, { ratio }) => {
    return update(state, {
      ratio: { $set: ratio },
      grounds: { $set: calculateGrounds(state.totalBrew, ratio) }
    });
  }),
  on(CalcActions.restoreTotalBrewSuccess, (state, { brew }) => {
    return update(state, {
      totalBrew: { $set: brew },
      grounds: { $set: calculateGrounds(brew, state.ratio) }
    });
  }),
  on(CalcActions.updateRatio, (state, { ratio }) => {
    const ratioVal = ratio > 0 ? ratio : 0;
    return update(state, {
      ratio: { $set: ratioVal },
      grounds: { $set: calculateGrounds(state.totalBrew, ratioVal) }
    });
  }),
  on(CalcActions.updateTotalBrew, (state, { brew }) => {
    const brewVal = brew > 0 ? brew : 0;
    return update(state, {
      totalBrew: { $set: brewVal },
      grounds: { $set: calculateGrounds(brewVal, state.ratio) }
    });
  }),
);

function calculateGrounds(totalBrew: number, ratio: number): number {
  if (ratio <= 2) {
    return 0;
  }
  return Utils.roundDecimal(totalBrew / (ratio - 2));
}

// State Selectors

export const getCalcState = (state: State): CalcState => state.calc;

export const getRatio = createSelector(
  getCalcState,
  (state) => state.ratio
);

export const getTotalBrew = createSelector(
  getCalcState,
  (state) => state.totalBrew
);

export const getGrounds = createSelector(
  getCalcState,
  (state) => state.grounds
);

// Custom Selectors

export const getGroundsInOunces = createSelector(
  getGrounds,
  (grounds) => Utils.roundDecimal(grounds / 10.25)
);

export const getGroundsInML = createSelector(
  getGroundsInOunces,
  (grounds) => Utils.roundDecimal(grounds * 29.574)
);

export const getGroundsInCups = createSelector(
  getGroundsInOunces,
  (grounds) => Utils.roundDecimal(grounds / 8)
);

export const getBrewBackgroundColor = createSelector(
  getRatio,
  (ratio) => BrewStrengthColor.backgroundColor(ratio)
);