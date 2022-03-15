import { createReducer, createSelector, on } from '@ngrx/store';
import { State } from 'src/app/states/index';
import * as CalcActions from 'src/app/states/calc/calc.actions';
import update from 'update-immutable';
import { Utils } from 'src/app/helpers/utils';
import { StopwatchStatus } from 'src/app/data-models/enum';

export const calcFeatureKey = 'calc';

export interface CalcState {
  ratio: number;
  totalBrew: number;
  stopwatch: {
    status: StopwatchStatus;
    startTime: number;
    lastTime: number;
  };
}

export const initialState: CalcState = {
  ratio: 16,
  totalBrew: 500,
  stopwatch: {
    status: StopwatchStatus.NotStarted,
    startTime: Date.now(),
    lastTime: Date.now()
  }
};

export const reducer = createReducer(
  initialState,
  on(CalcActions.restoreRatioSuccess, (state, { ratio }) => {
    return update(state, {
      ratio: { $set: ratio }
    });
  }),
  on(CalcActions.restoreTotalBrewSuccess, (state, { brew }) => {
    return update(state, {
      totalBrew: { $set: brew }
    });
  }),
  on(CalcActions.restoreStopwatchSuccess, (state, { status, startTime, lastTime }) => {
    return update(state, {
      stopwatch: {
        status: { $set: status },
        startTime: { $set: startTime },
        lastTime: { $set: lastTime }
      }
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
  on(CalcActions.toggleStopwatchRun, (state) => {
    if (state.stopwatch.status === StopwatchStatus.Running) {
      return update(state, {
        stopwatch: {
          status: { $set: StopwatchStatus.Paused }
        }
      });
    }
    if (state.stopwatch.status === StopwatchStatus.Paused) {
      const duration = state.stopwatch.lastTime - state.stopwatch.startTime;

      return update(state, {
        stopwatch: {
          status: { $set: StopwatchStatus.Running },
          startTime: { $set: Date.now() - duration },
          lastTime: { $set: Date.now() }
        }
      });
    }

    return update(state, {
      stopwatch: {
        status: { $set: StopwatchStatus.Running },
        startTime: { $set: Date.now() },
        lastTime: { $set: Date.now() }
      }
    });
  }),
  on(CalcActions.tickStopwatch, (state, { now }) => {
    return update(state, {
      stopwatch: {
        lastTime: { $set: now }
      }
    });
  }),
  on(CalcActions.resetStopwatch, (state) => {
    return update(state, {
      stopwatch: {
        status: { $set: StopwatchStatus.NotStarted },
        startTime: { $set: Date.now() },
        lastTime: { $set: Date.now() }
      }
    });
  })
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
  (state) => calculateGrounds(state.totalBrew, state.ratio)
);

export const getStopwatchStatus = createSelector(
  getCalcState,
  (state) => state.stopwatch.status
);

export const getStopwatchStartTime = createSelector(
  getCalcState,
  (state) => state.stopwatch.startTime
);

export const getStopwatchLastTime = createSelector(
  getCalcState,
  (state) => state.stopwatch.lastTime
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

export const getStopwatchDuration = createSelector(
  getStopwatchStartTime, getStopwatchLastTime,
  (startTime, lastTime) => (lastTime - startTime) / 1000
);
