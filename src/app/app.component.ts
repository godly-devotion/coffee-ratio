import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import * as fromRoot from 'src/app/states';
import * as fromCalc from 'src/app/states/calc/calc.reducer';
import * as CalcActions from 'src/app/states/calc/calc.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  ratio$: Observable<number>;
  totalBrew$: Observable<number>;
  grounds$: Observable<number>;
  groundsInOunces$: Observable<number>;
  groundsInML$: Observable<number>;
  groundsInCups$: Observable<number>;

  private destroy$ = new Subject<boolean>();

  constructor(
    private store: Store<fromRoot.State>,
  ) {
    this.ratio$ = store.select(fromCalc.getRatio);
    this.totalBrew$ = store.select(fromCalc.getTotalBrew);
    this.grounds$ = store.select(fromCalc.getGrounds);
    this.groundsInOunces$ = store.select(fromCalc.getGroundsInOunces);
    this.groundsInML$ = store.select(fromCalc.getGroundsInML);
    this.groundsInCups$ = store.select(fromCalc.getGroundsInCups);
    store.select(fromCalc.getBrewBackgroundColor).pipe(
      tap(color => document.getElementById('body')!.style.background = color),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(false);
    this.destroy$.complete();
  }

  updateRatio(ratio: number): void {
    this.store.dispatch(CalcActions.updateRatio({ ratio }));
  }

  updateTotalBrew(brew: number): void {
    this.store.dispatch(CalcActions.updateTotalBrew({ brew }));
  }
}
