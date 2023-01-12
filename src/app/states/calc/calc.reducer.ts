import { createReducer, createSelector, on } from '@ngrx/store'
import { State } from 'src/app/states/index'
import * as CalcActions from 'src/app/states/calc/calc.actions'
import update from 'update-immutable'
import { Utils } from 'src/app/helpers/utils'
import { VolumeUnit } from 'src/app/data-models/enum'
import { CalcDefaults } from 'src/app/data-models/calc-defaults'

export const calcFeatureKey = 'calc'

export interface CalcState {
  waterRatio: number;
  useBlendRatio: boolean;
  blendRatio: number;
  totalBrew: number;
  totalBrewUnit: VolumeUnit;
}

export const initialState: CalcState = {
  waterRatio: CalcDefaults.waterRatio,
  useBlendRatio: CalcDefaults.useBlendRatio,
  blendRatio: CalcDefaults.blendRatio,
  totalBrew: CalcDefaults.totalBrew,
  totalBrewUnit: CalcDefaults.totalBrewUnit
}

export const reducer = createReducer(
  initialState,
  on(CalcActions.restorePreferencesSuccess, (state, { waterRatio, useBlendRatio, blendRatio, brew, unit }) => {
    return update(state, {
      waterRatio: { $set: waterRatio },
      useBlendRatio: { $set: useBlendRatio },
      blendRatio: { $set: blendRatio },
      totalBrew: { $set: brew },
      totalBrewUnit: { $set: unit }
    })
  }),

  on(CalcActions.updateWaterRatio, (state, { waterRatio }) => {
    const ratioVal = waterRatio > 0 ? waterRatio : 0

    return update(state, {
      waterRatio: { $set: ratioVal }
    })
  }),
  on(CalcActions.toggleBlendRatioUse, (state) => {
    return update(state, {
      useBlendRatio: { $set: !state.useBlendRatio }
    })
  }),
  on(CalcActions.updateBlendRatio, (state, { blendRatio }) => {
    const ratioVal = blendRatio > 0 ? blendRatio : 0

    return update(state, {
      blendRatio: { $set: ratioVal }
    })
  }),
  on(CalcActions.updateTotalBrew, (state, { brew }) => {
    const brewVal = brew > 0 ? brew : 0

    return update(state, {
      totalBrew: { $set: brewVal }
    })
  }),
  on(CalcActions.updateTotalBrewUnit, (state, { unit }) => {
    return update(state, {
      totalBrew: { $set: Utils.convertVolumeUnits(state.totalBrew, state.totalBrewUnit, unit) },
      totalBrewUnit: { $set: unit }
    })
  })
)

function calculateGrounds(brewML: number, ratio: number): number {
  if (ratio <= 0) {
    return 0
  }

  return brewML / ratio
}

// State Selectors

export const getCalcState = (state: State): CalcState => state.calc

export const getWaterRatio = createSelector(
  getCalcState,
  (state) => state.waterRatio
)

export const getUseBlendRatio = createSelector(
  getCalcState,
  (state) => state.useBlendRatio
)

export const getBlendRatio = createSelector(
  getCalcState,
  (state) => state.blendRatio
)

export const getTotalBrew = createSelector(
  getCalcState,
  (state) => state.totalBrew
)

export const getTotalBrewUnit = createSelector(
  getCalcState,
  (state) => state.totalBrewUnit
)

// Custom Selectors

export const getTotalBrewDisplay = createSelector(
  getTotalBrew,
  (brew) => Utils.roundDecimal(brew)
)

export const getGrounds = createSelector(
  getTotalBrew, getTotalBrewUnit, getWaterRatio,
  (brew, brewUnit, waterRatio) => {
    const brewML = Utils.convertVolumeUnits(brew, brewUnit, VolumeUnit.ML)
    const grounds = calculateGrounds(brewML, waterRatio)

    return Utils.roundDecimal(grounds)
  }
)

export const getGroundsInOunces = createSelector(
  getGrounds,
  (grounds) => Utils.roundDecimal(grounds / 10.25)
)

export const getGroundsInML = createSelector(
  getGroundsInOunces,
  (grounds) => Utils.roundDecimal(grounds * 29.574)
)

export const getGroundsInCups = createSelector(
  getGroundsInOunces,
  (grounds) => Utils.roundDecimal(grounds / 8)
)
