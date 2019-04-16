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
  stats$: Subject<IncidentStatus> = new Subject();

  status: IncidentStatus = new IncidentStatus();
  percent = 0;
  total = 0;

  constructor() {}

  ngOnInit() {

    this.stats$.subscribe(newStatus => {
      this.status = newStatus;
      this.total = this.status.requested + this.status.rescued + this.status.assigned + this.status.pickedUp + this.status.cancelled;
      this.percent = (this.status.rescued / this.total) * 100;
    });
  }
}
