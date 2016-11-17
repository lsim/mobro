import { Component, Input } from '@angular/core';
import { LogService, LogEntry } from '../services/log.service';

@Component({
  selector: 'mb-logarea',
  templateUrl: 'app/shared/logarea/logarea.component.html',
  styleUrls: ['app/shared/logarea/logarea.component.css']
})
export class LogAreaComponent {
  displayedEntries: LogEntry[] = [];

  @Input() numLines: number = 10;

  constructor(logService: LogService) {
    logService.entryLogged.subscribe((logEntry: LogEntry) => {
      this.displayedEntries.unshift(logEntry);
      if(this.displayedEntries.length > this.numLines) {
        this.displayedEntries.splice(this.numLines - 1, this.displayedEntries.length - this.numLines);
      }
    });
  }
}
