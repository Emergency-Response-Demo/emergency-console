import { Component, OnInit } from '@angular/core';
import { IncidentStatus } from './incident-status';
import { IncidentStatusService } from './incident-status.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-incident-status',
  templateUrl: './incident-status.component.html',
  styleUrls: ['./incident-status.component.scss']
})
export class IncidentStatusComponent implements OnInit {
  incidentStatus: IncidentStatus;
  incidentPercent: number;
  incidentTotal: number;

  constructor(private incidentStatusService: IncidentStatusService, private dashboardService: DashboardService) {
    this.incidentStatus = new IncidentStatus();
    this.dashboardService.reload$.subscribe(res => {
      console.log(`Incident component ${res}`);
      this.load();
    });
  }

  load(): void {
    this.incidentStatusService.getStatus().subscribe(res => {
      this.incidentStatus = res;
      this.incidentTotal = this.incidentStatus.requested + this.incidentStatus.rescued;
      this.incidentPercent = (this.incidentStatus.rescued / this.incidentTotal) * 100;
    });
  }

  ngOnInit() {
    this.load();
  }
}
