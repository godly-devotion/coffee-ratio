import { createReducer, createSelector, on } from '@ngrx/store'
import { State } from 'src/app/states/index'
import * as StopwatchActions from 'src/app/states/stopwatch/stopwatch.actions'
import update from 'update-immutable'
import { StopwatchStatus } from 'src/app/data-models/enum'

export const stopwatchFeatureKey = 'stopwatch'

export interface StopwatchState {
  status: StopwatchStatus;
  startTime: number;
  lastTime: number;
}

export const initialState: StopwatchState = {
  status: StopwatchStatus.NotStarted,
  startTime: Date.now(),
  lastTime: Date.now()
}

export const reducer = createReducer(
  initialState,
  on(StopwatchActions.restoreSuccess, (state, { status, startTime, lastTime }) => {
    return update(state, {
      status: { $set: status },
      startTime: { $set: startTime },
      lastTime: { $set: lastTime }
    })
  }),
  on(StopwatchActions.toggleRun, (state) => {
    if (state.status === StopwatchStatus.Running) {
      return update(state, {
        status: { $set: StopwatchStatus.Paused }
      })
    }
    if (state.status === StopwatchStatus.Paused) {
      const duration = state.lastTime - state.startTime

      return update(state, {
        status: { $set: StopwatchStatus.Running },
        startTime: { $set: Date.now() - duration },
        lastTime: { $set: Date.now() }
      })
    }

    return update(state, {
      status: { $set: StopwatchStatus.Running },
      startTime: { $set: Date.now() },
      lastTime: { $set: Date.now() }
    })
  }),
  on(StopwatchActions.tick, (state, { now }) => {
    return update(state, {
      lastTime: { $set: now }
    })
  }),
  on(StopwatchActions.reset, (state) => {
    return update(state, {
      status: { $set: StopwatchStatus.NotStarted },
      startTime: { $set: Date.now() },
      lastTime: { $set: Date.now() }
    })
  })
)

export const getStopwatchState = (state: State): StopwatchState => state.stopwatch

// State Selectors

export const getStopwatchStatus = createSelector(
  getStopwatchState,
  (state) => state.status
)

export const getStopwatchStartTime = createSelector(
  getStopwatchState,
  (state) => state.startTime
)

export const getStopwatchLastTime = createSelector(
  getStopwatchState,
  (state) => state.lastTime
)

// Custom Selectors

export const getStopwatchDuration = createSelector(
  getStopwatchStartTime, getStopwatchLastTime,
  (startTime, lastTime) => (lastTime - startTime) / 1000
)
