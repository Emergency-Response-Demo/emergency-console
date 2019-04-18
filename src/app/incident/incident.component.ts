import { Component, OnInit, Input } from '@angular/core';
import { IncidentStatus } from './incident-status';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {

  @Input()
  status: IncidentStatus = new IncidentStatus();

  constructor() { }

  ngOnInit() {
  }
}
