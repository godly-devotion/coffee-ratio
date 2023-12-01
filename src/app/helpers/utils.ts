import { VolumeUnit } from 'src/app/data-models/enum';

export class Utils {
  public static roundDecimal(value: number): number {
    return Math.round(100 * value) / 100;
  }

  public static convertVolumeUnits(
    value: number,
    sourceUnit: VolumeUnit,
    targetUnit: VolumeUnit,
  ): number {
    if (sourceUnit === targetUnit) {
      return value;
    }

    switch (targetUnit) {
      case VolumeUnit.ML:
        return value * 29.574;
      case VolumeUnit.OZ:
        return value / 29.574;
      default:
        return 0;
    }
  }
}
