//
//  Originally created by Sasha Friedenberg on 03/17/2018.
//  https://github.com/brushedtype/Ratios/blob/main/Ratios/Helpers/BrewStrengthColor.swift
//

import { ColorRatio } from "../data-models/color-ratio";

export class BrewStrengthColor {
  private static weakBackgroundColor: ColorRatio = {
    red: 0.90,
    green: 0.81,
    blue: 0.72
  };
  private static strongBackgroundColor: ColorRatio = {
    red: 0.80,
    green: 0.67,
    blue: 0.56
  };
  private static minRatio = 12;
  private static maxRatio = 20;

  public static backgroundColor(ratio: number): string {
    if (ratio >= this.maxRatio) {
      // a ratio of 1/maxRatio produces a weaker brew
      return this.convertColorRatioToCSS(this.weakBackgroundColor);
    }

    if (ratio <= this.minRatio) {
      // a ratio of 1/minRatio produces a stronger brew
      return this.convertColorRatioToCSS(this.strongBackgroundColor);
    }

    const newRed = this.getNewColor(
      ratio,
      this.strongBackgroundColor.red,
      this.weakBackgroundColor.red
    );
    const newGreen = this.getNewColor(
      ratio,
      this.strongBackgroundColor.green,
      this.weakBackgroundColor.green
    );
    const newBlue = this.getNewColor(
      ratio,
      this.strongBackgroundColor.blue,
      this.weakBackgroundColor.blue
    );
    const newColorRatio: ColorRatio = {
      red: newRed,
      green: newGreen,
      blue: newBlue
    };

    return this.convertColorRatioToCSS(newColorRatio);
  }

  private static convertColorRatioToCSS(color: ColorRatio): string {
    return `rgb(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)})`;
  }

  private static getNewColor(ratio: number, min: number, max: number): number {
    const colorOffsetFraction = (ratio - this.minRatio) / (this.maxRatio - this.minRatio);
    return ((max - min) * colorOffsetFraction) + min;
  }
}
