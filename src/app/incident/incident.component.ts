import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { IncidentStatus } from '../models/incident-status';
import { DisasterSimulatorService } from '../services/disaster-simulator.service';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {

  @Input()
  status: IncidentStatus = new IncidentStatus();
  @Input()
  incidentCommander: boolean;
  @Input()
  displayKickstart: boolean;

  constructor(public disasterSimulatorService: DisasterSimulatorService) { }

  ngOnInit() {
  }

  public startSimulation() {
    this.displayKickstart = false;
    this.disasterSimulatorService.clearResponders();
    this.disasterSimulatorService.generateIncidents();
    this.disasterSimulatorService.generateResponders();
  }
}
