import { Component, OnInit, Input } from '@angular/core';
import { IncidentStatus } from './incident-status';
import { IncidentService } from './incident.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  @Input()
  reload$: Subject<string>;

  status: IncidentStatus;
  percent: number;
  total: number;

  constructor(private incidentService: IncidentService) {
    this.status = new IncidentStatus();
    this.reload$ = new Subject();
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

    this.reload$.subscribe(res => {
      this.load();
    });
  }
}
