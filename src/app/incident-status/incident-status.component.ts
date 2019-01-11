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
  status: IncidentStatus;
  percent: number;
  total: number;

  constructor(private incidentStatusService: IncidentStatusService, private dashboardService: DashboardService) {
    this.status = new IncidentStatus();
    this.dashboardService.reload$.subscribe(res => {
      this.load();
    });
  }

  load(): void {
    this.incidentStatusService.getStatus().subscribe(res => {
      this.status = res;
      this.total = this.status.requested + this.status.rescued + this.status.assigned + this.status.pickedUp + this.status.cancelled;
      this.percent = (this.status.rescued / this.total) * 100;
    });
  }

  ngOnInit() {
    this.load();
  }
}
