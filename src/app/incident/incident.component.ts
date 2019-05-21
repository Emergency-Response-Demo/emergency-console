import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { IncidentStatus } from '../models/incident-status';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentComponent implements OnInit {

  @Input()
  status: IncidentStatus = new IncidentStatus();

  constructor() { }

  ngOnInit() {
  }
}
