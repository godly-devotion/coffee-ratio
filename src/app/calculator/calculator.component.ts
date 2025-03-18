import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, filter, tap } from 'rxjs';
import { VolumeUnit } from '../shared/volume-unit.model';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-calculator',
  templateUrl: 'calculator.component.html',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgClass,
    ReactiveFormsModule,
  ],
})
export class CalculatorComponent implements AfterViewInit {
  readonly waterRatio = signal(16);
  readonly useBlendRatio = signal(false);
  readonly blendRatio = signal(2);
  readonly brew = signal(500);
  readonly brewUnit = signal(VolumeUnit.ML);
  readonly grounds = computed(() => {
    const brewML = Utils.convertVolumeUnits(
      this.brew(),
      this.brewUnit(),
      VolumeUnit.ML,
    );
    const grounds = this.calculateGrounds(brewML, this.waterRatio());
    return Utils.roundDecimal(grounds);
  });
  readonly groundsInOunces = computed(() =>
    Utils.roundDecimal(this.grounds() / 10.25),
  );
  readonly groundsInML = computed(() =>
    Utils.roundDecimal(this.groundsInOunces() * 29.574),
  );
  readonly groundsInCups = computed(() =>
    Utils.roundDecimal(this.groundsInOunces() / 8),
  );
  readonly waterRatioOptions = [...Array(22).keys()].map(
    (startIndex) => startIndex + 1,
  );
  VolumeUnit = VolumeUnit;
  Utils = Utils;

  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);
  private readonly waterRatioKey = 'calculator-water-ratio';
  private readonly useBlendRatioKey = 'calculator-use-blend-ratio';
  private readonly blendRatioKey = 'calculator-blend-ratio';
  private readonly brewKey = 'calculator-brew';
  private readonly brewUnitKey = 'calculator-brew-unit';

  canCalc = (group: AbstractControl): ValidationErrors | null => {
    if (!group) {
      return null;
    }

    const waterRatioControl = group.get('waterRatio');
    const brewControl = group.get('brew');

    if (!waterRatioControl || !brewControl) {
      return null;
    }

    if (!waterRatioControl.value) {
      return { waterRatioEmpty: 'Water ratio is required' };
    }

    if (!brewControl.value) {
      return { brewEmpty: 'Brew is required.' };
    }

    return null;
  };

  form = this.formBuilder.nonNullable.group(
    {
      waterRatio: [
        this.waterRatio(),
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.min(3),
        ],
      ],
      brew: [
        this.brew(),
        [
          Validators.required,
          Validators.pattern('^([0-9]+.?[0-9]*|.[0-9]+)$'),
          Validators.min(0),
        ],
      ],
    },
    {
      validators: [this.canCalc],
    },
  );

  constructor() {
    this.restoreState();

    effect(() => {
      this.form.patchValue(
        { waterRatio: this.waterRatio() },
        { emitEvent: false },
      );
      localStorage.setItem(this.waterRatioKey, this.waterRatio().toString());
    });
    effect(() =>
      localStorage.setItem(
        this.useBlendRatioKey,
        this.useBlendRatio().toString(),
      ),
    );
    effect(() =>
      localStorage.setItem(this.blendRatioKey, this.blendRatio().toString()),
    );
    effect(() => {
      this.form.patchValue(
        { brew: Utils.roundDecimal(this.brew()) },
        { emitEvent: false },
      );
      localStorage.setItem(this.brewKey, this.brew().toString());
    });
    effect(() =>
      localStorage.setItem(this.brewUnitKey, this.brewUnit().toString()),
    );

    this.form.controls.waterRatio.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((waterRatio) => !Number.isNaN(waterRatio)),
        tap((waterRatio) => this.updateWaterRatio(waterRatio)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.form.controls.brew.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((brew) => !Number.isNaN(brew)),
        tap((brew) => this.updateTotalBrew(brew)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    const element = document.getElementById(`waterRatio${this.waterRatio()}`);

    element?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    });
  }

  updateWaterRatio(ratio: number): void {
    const newRatio = ratio > 0 ? ratio : 0;
    this.waterRatio.set(newRatio);
  }

  toggleUseBlendRatio(): void {
    this.useBlendRatio.set(!this.useBlendRatio());
  }

  updateBlendRatio(blendRatio: number): void {
    const newRatio = blendRatio > 0 ? blendRatio : 0;
    this.blendRatio.set(newRatio);
  }

  updateTotalBrew(brew: number): void {
    const newBrew = brew > 0 ? brew : 0;
    this.brew.set(newBrew);
  }

  updateTotalBrewUnit(unit: VolumeUnit): void {
    const brew = Utils.convertVolumeUnits(this.brew(), this.brewUnit(), unit);
    this.brew.set(brew);
    this.brewUnit.set(unit);
  }

  private restoreState(): void {
    const waterRatio = Number(localStorage.getItem(this.waterRatioKey) ?? 16);
    const useBlendRatio =
      localStorage.getItem(this.useBlendRatioKey) === 'true';
    const blendRatio = Number(localStorage.getItem(this.blendRatioKey) ?? 2);
    const brew = Number(localStorage.getItem(this.brewKey) ?? 500);
    const brewUnit =
      (localStorage.getItem(this.brewUnitKey) as VolumeUnit) ?? VolumeUnit.ML;

    if (
      Number.isNaN(waterRatio) ||
      Number.isNaN(blendRatio) ||
      Number.isNaN(brew)
    ) {
      return;
    }

    this.waterRatio.set(waterRatio);
    this.useBlendRatio.set(useBlendRatio);
    this.blendRatio.set(blendRatio);
    this.brew.set(brew);
    this.brewUnit.set(brewUnit);
  }

  private calculateGrounds(brewML: number, ratio: number): number {
    if (ratio <= 0) {
      return 0;
    }

    return brewML / ratio;
  }
}
