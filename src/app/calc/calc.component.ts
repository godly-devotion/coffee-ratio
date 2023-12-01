import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
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
import { VolumeUnit, StopwatchStatus } from 'src/app/data-models/enum';
import { Utils } from 'src/app/helpers/utils';
import { CalcDefaults } from 'src/app/data-models/calc-defaults';
import { StopwatchDurationPipe } from 'src/app/pipes/stopwatch-duration.pipe';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.component.html',
  styleUrls: ['./calc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ReactiveFormsModule,
    StopwatchDurationPipe,
  ],
})
export class CalcComponent implements OnInit, AfterViewInit, OnChanges {
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

  waterRatioOptions = [...Array(22).keys()].map((startIndex) => startIndex + 1);

  private destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group(
      {
        waterRatio: [
          this.waterRatio,
          [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.min(3),
          ],
        ],
        brew: [
          this.brew,
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

    this.form.controls['waterRatio'].valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((waterRatio) => !Number.isNaN(waterRatio)),
        tap((waterRatio) => this.updateWaterRatio.emit(waterRatio)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.form.controls['brew'].valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((brew) => !Number.isNaN(brew)),
        tap((brew) => this.updateTotalBrew.emit(brew)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    const element = document.getElementById(`waterRatio${this.waterRatio}`);

    element?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brew']?.currentValue) {
      const brew = changes['brew']?.currentValue;

      this.form?.patchValue({ brew }, { emitEvent: false });
    }
  }

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
      return { waterRatioEmtpy: 'Water ratio is required' };
    }

    if (!brewControl.value) {
      return { brewEmpty: 'Brew is required.' };
    }

    return null;
  };
}
