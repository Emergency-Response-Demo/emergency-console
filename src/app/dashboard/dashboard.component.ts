import { Component, OnInit } from '@angular/core';
import { IconDefinition, faSync, faBan } from '@fortawesome/free-solid-svg-icons';
import { interval } from 'rxjs/internal/observable/interval';
import { Subject } from 'rxjs/internal/Subject';
import { IncidentStatus } from '../incident/incident-status';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  refreshIcon: IconDefinition = faSync;
  stopIcon: IconDefinition = faBan;
  polling: any;
  isPolling = false;
  reload$: Subject<string> = new Subject();
  stats$: Subject<IncidentStatus> = new Subject();

  constructor() {}

  togglePolling() {
    this.isPolling = !this.isPolling;

    if (this.isPolling === true) {
      this.polling = interval(2000).subscribe(n => {
        this.reload$.next('reload');
      });
    } else {
      this.polling.unsubscribe();
    }
  }

  ngOnInit() {}
}
