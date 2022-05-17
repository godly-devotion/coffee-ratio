import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { distinctUntilChanged, filter, Subject, takeUntil, tap } from 'rxjs';
import { VolumeUnit, StopwatchStatus } from 'src/app/data-models/enum';
import { Utils } from 'src/app/helpers/utils';
import { CalcDefaults } from 'src/app/data-models/calc-defaults';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.component.html',
  styleUrls: ['./calc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalcComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() waterRatio = CalcDefaults.waterRatio;
  @Input() useBlendRatio = CalcDefaults.useBlendRatio;
  @Input() blendRatio = CalcDefaults.blendRatio;
  @Input() brew = CalcDefaults.totalBrew;
  @Input() brewUnit = CalcDefaults.totalBrewUnit;
  @Input() grounds = 0;
  @Input() groundsInOunces = 0;
  @Input() groundsInML = 0;
  @Input() groundsInCups = 0;
  @Input() stopwatchStatus = StopwatchStatus.NotStarted;
  @Input() stopwatchDuration = 0;
  @Output() updateWaterRatio = new EventEmitter<number>();
  @Output() toggleUseBlendRatio = new EventEmitter();
  @Output() updateBlendRatio = new EventEmitter<number>();
  @Output() updateTotalBrew = new EventEmitter<number>();
  @Output() updateTotalBrewUnit = new EventEmitter<VolumeUnit>();
  @Output() toggleStopwatchRun = new EventEmitter();
  @Output() resetStopwatch = new EventEmitter();
  form!: FormGroup;
  StopwatchStatus = StopwatchStatus;
  VolumeUnit = VolumeUnit;
  Utils = Utils;

  waterRatioOptions = [...Array(18).keys()].map(startIndex => startIndex + 1);

  private destroy$ = new Subject<boolean>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      waterRatio: [this.waterRatio, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(3)]],
      brew: [this.brew, [Validators.required, Validators.pattern('^([0-9]+\.?[0-9]*|\.[0-9]+)$'), Validators.min(0)]]
    }, {
      validators: [this.canCalc]
    });

    this.form.controls['waterRatio'].valueChanges.pipe(
      distinctUntilChanged(),
      filter(waterRatio => !Number.isNaN(waterRatio)),
      tap(waterRatio => this.updateWaterRatio.emit(waterRatio)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form.controls['brew'].valueChanges.pipe(
      distinctUntilChanged(),
      filter(brew => !Number.isNaN(brew)),
      tap(brew => this.updateTotalBrew.emit(brew)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngAfterViewInit(): void {
    const element = document.getElementById(`waterRatio${this.waterRatio}`);

    element?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brew']?.currentValue) {
      const brew = changes['brew']?.currentValue;

      this.form?.patchValue({ brew }, { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
  }

  canCalc = (form: FormGroup): ValidationErrors | null => {
    if (!form) {
      return null;
    }

    const waterRatioControl = form.get('waterRatio');
    const brewControl = form.get('brew');

    if (!waterRatioControl || !brewControl) {
      return null;
    }

    if (!waterRatioControl.value) {
      return { waterRatioEmtpy: 'Water ratio is required' };
    }

    if (!brewControl.value) {
      return { brewEmpty: 'Brew is required.' };
    }

    return null;
  };
}
