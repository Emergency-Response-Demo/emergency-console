import { Component, OnInit } from '@angular/core';
import { IncidentStatus } from './incident-status';
import { IncidentStatusService } from './incident-status.service';

@Component({
  selector: 'app-incident-status',
  templateUrl: './incident-status.component.html',
  styleUrls: ['./incident-status.component.scss']
})
export class IncidentStatusComponent implements OnInit {
  incidentStatus: IncidentStatus;
  incidentPercent: number;
  incidentTotal: number;

  constructor(private incidentStatusService: IncidentStatusService) {
    this.incidentStatus = new IncidentStatus();
  }

  ngOnInit() {
    this.incidentStatusService.getStatus().subscribe(res => {
      this.incidentStatus = res;
      this.incidentTotal = this.incidentStatus.requested + this.incidentStatus.rescued;
      this.incidentPercent = (this.incidentStatus.rescued / this.incidentTotal) * 100;
    });
  }
}
