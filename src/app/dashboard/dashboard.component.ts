import { Component, OnInit } from '@angular/core';
import { IconDefinition, faSync, faBan } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from './dashboard.service';
import { interval } from 'rxjs/internal/observable/interval';

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

  constructor(private dashboardService: DashboardService) {
    this.refreshIcon = faSync;
    this.stopIcon = faBan;
  }

  refresh() {
    this.isPolling = true;

    this.polling = interval(2000).subscribe(n => {
      console.log(`Polling loop ${n}`);
      this.dashboardService.refresh();
    });
  }

  stop() {
    this.isPolling = false;
    this.polling.unsubscribe();
  }

  ngOnInit() {}
}
