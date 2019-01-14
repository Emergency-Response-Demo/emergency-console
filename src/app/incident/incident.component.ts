import { Component, OnInit } from '@angular/core';
import { IncidentStatus } from './incident-status';
import { IncidentService } from './incident.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  status: IncidentStatus;
  percent: number;
  total: number;

  constructor(private incidentService: IncidentService, private dashboardService: DashboardService) {
    this.status = new IncidentStatus();
    this.dashboardService.reload$.subscribe(res => {
      this.load();
    });
  }

  load(): void {
    this.incidentService.getStatus().subscribe(res => {
      this.status = res;
      this.total = this.status.requested + this.status.rescued + this.status.assigned + this.status.pickedUp + this.status.cancelled;
      this.percent = (this.status.rescued / this.total) * 100;
    });
  }

  ngOnInit() {
    this.load();
  }
}
