import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { VolumeUnit } from '../shared/volume-unit.model';
import { Utils } from '../shared/utils';

enum StorageKeys {
  WaterRatio = 'calculator-water-ratio',
  UseBlendRatio = 'calculator-use-blend-ratio',
  BlendRatio = 'calculator-blend-ratio',
  Brew = 'calculator-brew',
  BrewUnit = 'calculator-brew-unit',
}

export interface CalculatorState {
  waterRatio: number;
  useBlendRatio: boolean;
  blendRatio: number;
  brew: number;
  brewUnit: VolumeUnit;
}

export const initialState: CalculatorState = {
  waterRatio: 16,
  useBlendRatio: false,
  blendRatio: 2,
  brew: 500,
  brewUnit: VolumeUnit.ML,
};

export const CalculatorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const grounds = computed(() => {
      const brewML = Utils.convertVolumeUnits(
        store.brew(),
        store.brewUnit(),
        VolumeUnit.ML,
      );
      const grounds = calculateGrounds(brewML, store.waterRatio());
      return Utils.roundDecimal(grounds);
    });
    const groundsInOunces = computed(() =>
      Utils.roundDecimal(grounds() / 10.25),
    );

    return {
      totalBrewDisplay: computed(() => Utils.roundDecimal(store.brew())),
      grounds,
      groundsInOunces,
      groundsInML: computed(() =>
        Utils.roundDecimal(groundsInOunces() * 29.574),
      ),
      groundsInCups: computed(() => Utils.roundDecimal(groundsInOunces() / 8)),
    };
  }),
  withMethods((store) => ({
    restorePreferences(): void {
      const waterRatio = Number(
        localStorage.getItem(StorageKeys.WaterRatio) ?? initialState.waterRatio,
      );
      const useBlendRatio =
        localStorage.getItem(StorageKeys.UseBlendRatio) === 'true';
      const blendRatio = Number(
        localStorage.getItem(StorageKeys.BlendRatio) ?? initialState.blendRatio,
      );
      const brew = Number(
        localStorage.getItem(StorageKeys.Brew) ?? initialState.brew,
      );
      const brewUnit =
        (localStorage.getItem(StorageKeys.BrewUnit) as VolumeUnit) ??
        initialState.brewUnit;

      if (
        Number.isNaN(waterRatio) ||
        Number.isNaN(blendRatio) ||
        Number.isNaN(brew) ||
        Number.isNaN(brewUnit)
      ) {
        return;
      }

      patchState(store, {
        waterRatio,
        useBlendRatio,
        blendRatio,
        brew,
        brewUnit,
      });
    },
    updateWaterRatio(waterRatio: number): void {
      const ratioVal = waterRatio > 0 ? waterRatio : 0;

      patchState(store, { waterRatio: ratioVal });

      localStorage.setItem(StorageKeys.WaterRatio, ratioVal.toString());
    },
    toggleUseBlendRatio(): void {
      const useBlendRatio = !store.useBlendRatio();

      patchState(store, { useBlendRatio });

      localStorage.setItem(StorageKeys.UseBlendRatio, useBlendRatio.toString());
    },
    updateBlendRatio(blendRatio: number): void {
      const ratioVal = blendRatio > 0 ? blendRatio : 0;

      patchState(store, { blendRatio: ratioVal });

      localStorage.setItem(StorageKeys.BlendRatio, ratioVal.toString());
    },
    updateTotalBrew(brew: number): void {
      const brewVal = brew > 0 ? brew : 0;

      patchState(store, { brew: brewVal });

      localStorage.setItem(StorageKeys.Brew, brewVal.toString());
    },
    updateTotalBrewUnit(brewUnit: VolumeUnit): void {
      const brew = Utils.convertVolumeUnits(
        store.brew(),
        store.brewUnit(),
        brewUnit,
      );

      patchState(store, {
        brew,
        brewUnit,
      });

      localStorage.setItem(StorageKeys.Brew, brew.toString());
      localStorage.setItem(StorageKeys.BrewUnit, brewUnit.toString());
    },
  })),
  withHooks({
    onInit(store): void {
      store.restorePreferences();
    },
  }),
);

function calculateGrounds(brewML: number, ratio: number): number {
  if (ratio <= 0) {
    return 0;
  }

  return brewML / ratio;
}
