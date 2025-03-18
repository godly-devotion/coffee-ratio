import { Component, computed, effect, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StopwatchStatus } from '../shared/stopwatch-status.model';
import { StopwatchDurationPipe } from '../shared/stopwatch-duration.pipe';

@Component({
  selector: 'app-stopwatch',
  templateUrl: 'stopwatch.component.html',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    StopwatchDurationPipe,
  ],
})
export class StopwatchComponent {
  readonly status = signal(StopwatchStatus.NotStarted);
  readonly startTime = signal(Date.now());
  readonly lastTime = signal(Date.now());
  readonly duration = computed(
    () => (this.lastTime() - this.startTime()) / 1000,
  );

  StopwatchStatus = StopwatchStatus;

  private intervalId = 0;
  private readonly statusKey = 'stopwatch-status';
  private readonly startTimeKey = 'stopwatch-start-time';
  private readonly lastTimeKey = 'stopwatch-last-time';

  constructor() {
    this.restoreState();

    effect(() =>
      localStorage.setItem(this.statusKey, this.status().toString()),
    );
    effect(() =>
      localStorage.setItem(this.startTimeKey, this.startTime().toString()),
    );
    effect(() =>
      localStorage.setItem(this.lastTimeKey, this.lastTime().toString()),
    );
  }

  toggleRun(): void {
    const now = Date.now();

    switch (this.status()) {
      case StopwatchStatus.Running: {
        this.status.set(StopwatchStatus.Paused);
        clearInterval(this.intervalId);
        break;
      }
      case StopwatchStatus.Paused:
      case StopwatchStatus.NotStarted: {
        const duration = this.lastTime() - this.startTime();
        this.status.set(StopwatchStatus.Running);
        this.startTime.set(now - duration);
        this.lastTime.set(now);
        this.intervalId = window.setInterval(() => this.tick(), 100);
        break;
      }
    }
  }

  reset(): void {
    const now = Date.now();

    clearInterval(this.intervalId);

    this.status.set(StopwatchStatus.NotStarted);
    this.startTime.set(now);
    this.lastTime.set(now);
  }

  private restoreState(): void {
    const status = Number(localStorage.getItem(this.statusKey));
    const startTime = Number(localStorage.getItem(this.startTimeKey));
    const lastTime = Number(localStorage.getItem(this.lastTimeKey));

    if (
      status &&
      !Number.isNaN(status) &&
      startTime &&
      !Number.isNaN(startTime) &&
      lastTime &&
      !Number.isNaN(lastTime)
    ) {
      this.status.set(status);
      this.startTime.set(startTime);
      this.lastTime.set(lastTime);
    }

    if (status === StopwatchStatus.Running) {
      this.intervalId = window.setInterval(() => this.tick(), 100);
    }
  }

  private tick(): void {
    const now = Date.now();
    const oneHourInSec = 3500;

    this.lastTime.set(now);

    if (this.duration() > oneHourInSec) {
      this.reset();
    }
  }
}
