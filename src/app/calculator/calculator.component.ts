import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  inject,
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
import { CalculatorStore } from '../signals/calculator.store';
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
  readonly store = inject(CalculatorStore);
  readonly waterRatioOptions = [...Array(22).keys()].map(
    (startIndex) => startIndex + 1,
  );
  VolumeUnit = VolumeUnit;
  Utils = Utils;

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

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

  form = this.fb.nonNullable.group(
    {
      waterRatio: [
        this.store.waterRatio(),
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.min(3),
        ],
      ],
      brew: [
        this.store.brew(),
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

  updateWaterRatio = effect(() => {
    this.form.patchValue(
      {
        waterRatio: this.store.waterRatio(),
      },
      { emitEvent: false },
    );
  });

  updateBrew = effect(() => {
    this.form.patchValue(
      { brew: Utils.roundDecimal(this.store.brew()) },
      { emitEvent: false },
    );
  });

  constructor() {
    this.form.controls.waterRatio.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((waterRatio) => !Number.isNaN(waterRatio)),
        tap((waterRatio) => this.store.updateWaterRatio(waterRatio)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.form.controls.brew.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((brew) => !Number.isNaN(brew)),
        tap((brew) => this.store.updateTotalBrew(brew)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    const element = document.getElementById(
      `waterRatio${this.store.waterRatio()}`,
    );

    element?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    });
  }
}
