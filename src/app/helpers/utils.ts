export class Utils {
  public static roundDecimal(value: number): number {
    return Math.round(100 * value) / 100;
  }
}
