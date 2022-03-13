import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { distinctUntilChanged, filter, Subject, takeUntil, tap } from 'rxjs';
import { StopwatchStatus } from 'src/app/data-models/enum';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.component.html',
  styleUrls: ['./calc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalcComponent implements OnInit, OnDestroy {
  @Input() ratio = 0;
  @Input() brew = 0;
  @Input() grounds = 0;
  @Input() groundsInOunces = 0;
  @Input() groundsInML = 0;
  @Input() groundsInCups = 0;
  @Input() stopwatchStatus = StopwatchStatus.NotStarted;
  @Input() stopwatchDuration = 0;
  @Output() updateRatio = new EventEmitter<number>();
  @Output() updateTotalBrew = new EventEmitter<number>();
  @Output() toggleStopwatchRun = new EventEmitter();
  @Output() resetStopwatch = new EventEmitter();
  form!: FormGroup;
  StopwatchStatus = StopwatchStatus;

  private destroy$ = new Subject<boolean>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      ratio: [this.ratio, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(3)]],
      brew: [this.brew, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0)]]
    }, {
      validators: [this.canCalc]
    });

    this.form.controls['ratio'].valueChanges.pipe(
      distinctUntilChanged(),
      filter(ratio => !Number.isNaN(ratio)),
      tap(ratio => this.updateRatio.emit(ratio)),
      takeUntil(this.destroy$)
    ).subscribe();

    this.form.controls['brew'].valueChanges.pipe(
      distinctUntilChanged(),
      filter(brew => !Number.isNaN(brew)),
      tap(brew => this.updateTotalBrew.emit(brew)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
  }

  canCalc = (form: FormGroup): ValidationErrors | null => {
    if (!form) {
      return null;
    }

    const ratioControl = form.get('ratio');
    const brewControl = form.get('brew');

    if (!ratioControl || !brewControl) {
      return null;
    }

    if (!ratioControl.value) {
      return { ratioEmtpy: 'Ratio is required' };
    }

    if (!brewControl.value) {
      return { brewEmpty: 'Brew is required.' };
    }

    return null;
  }
}
