import { Component, OnInit } from '@angular/core';
import { IconDefinition, faSync, faBan } from '@fortawesome/free-solid-svg-icons';
import { interval } from 'rxjs/internal/observable/interval';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  refreshIcon: IconDefinition;
  stopIcon: IconDefinition;
  polling: any;
  isPolling = false;
  reload$: Subject<string>;

  constructor() {
    this.refreshIcon = faSync;
    this.stopIcon = faBan;
    this.reload$ = new Subject();
  }

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
