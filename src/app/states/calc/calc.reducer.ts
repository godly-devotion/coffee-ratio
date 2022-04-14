import { createReducer, createSelector, on } from '@ngrx/store';
import { State } from 'src/app/states/index';
import * as CalcActions from 'src/app/states/calc/calc.actions';
import update from 'update-immutable';
import { Utils } from 'src/app/helpers/utils';
import { VolumeUnit } from 'src/app/data-models/enum';

export const calcFeatureKey = 'calc';

export interface CalcState {
  ratio: number;
  totalBrew: number;
  totalBrewUnit: VolumeUnit;
}

export const initialState: CalcState = {
  ratio: 16,
  totalBrew: 500,
  totalBrewUnit: VolumeUnit.ML
};

export const reducer = createReducer(
  initialState,
  on(CalcActions.restoreRatioSuccess, (state, { ratio }) => {
    return update(state, {
      ratio: { $set: ratio }
    });
  }),
  on(CalcActions.restoreTotalBrewSuccess, (state, { brew, unit }) => {
    return update(state, {
      totalBrew: { $set: brew },
      totalBrewUnit: { $set: unit }
    });
  }),

  on(CalcActions.updateRatio, (state, { ratio }) => {
    const ratioVal = ratio > 0 ? ratio : 0;

    return update(state, {
      ratio: { $set: ratioVal }
    });
  }),
  on(CalcActions.updateTotalBrew, (state, { brew }) => {
    const brewVal = brew > 0 ? brew : 0;

    return update(state, {
      totalBrew: { $set: brewVal }
    });
  }),
  on(CalcActions.updateTotalBrewUnit, (state, { unit }) => {
    return update(state, {
      totalBrew: { $set: Utils.convertVolumeUnits(state.totalBrew, state.totalBrewUnit, unit) },
      totalBrewUnit: { $set: unit }
    });
  })
);

function calculateGrounds(brewML: number, ratio: number): number {
  if (ratio <= 2) {
    return 0;
  }

  return brewML / (ratio - 2);
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

export const getTotalBrewUnit = createSelector(
  getCalcState,
  (state) => state.totalBrewUnit
);

// Custom Selectors

export const getTotalBrewDisplay = createSelector(
  getTotalBrew,
  (brew) => Utils.roundDecimal(brew)
);

export const getGrounds = createSelector(
  getTotalBrew, getTotalBrewUnit, getRatio,
  (brew, brewUnit, ratio) => {
    const brewML = Utils.convertVolumeUnits(brew, brewUnit, VolumeUnit.ML);
    const grounds = calculateGrounds(brewML, ratio);

    return Utils.roundDecimal(grounds);
  }
);

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
