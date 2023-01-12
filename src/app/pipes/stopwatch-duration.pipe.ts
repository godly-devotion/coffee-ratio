import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'stopwatchDuration'
})
export class StopwatchDurationPipe implements PipeTransform {
  transform(value: number): string {
    if (!value || Number.isNaN(value) || value < 0) {
      return '00:00.0'
    }

    // YYYY-MM-DDTHH:mm:ss.sssZ
    return new Date(value * 1000)
      .toISOString()
      .slice(14, -3)
  }
}
