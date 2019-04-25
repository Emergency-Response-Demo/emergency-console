import { Component, OnInit } from '@angular/core';
import { IconDefinition, faSync, faBan } from '@fortawesome/free-solid-svg-icons';
import { interval } from 'rxjs/internal/observable/interval';
import { IncidentStatus } from '../models/incident-status';
import { Shelter } from '../models/shelter';
import { Responder } from '../models/responder';
import { Incident } from '../models/incident';
import { MissionRoute } from '../models/mission-route';
import { MessageService } from '../services/message.service';
import { IncidentService } from '../services/incident.service';
import { ResponderService } from '../services/responder.service';
import { Mission } from '../models/mission';
import { ResponderStatus } from '../models/responder-status';
import { ShelterService } from '../services/shelter.service';
import { MissionService } from '../services/mission.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  refreshIcon: IconDefinition = faSync;
  stopIcon: IconDefinition = faBan;
  polling: any;
  interval: number = Number(window['_env'].pollingInterval) || 10000;
  isPolling = false;
  incidentStatus: IncidentStatus = new IncidentStatus();
  responderStatus: ResponderStatus;
  responders: Responder[] = new Array();
  incidents: Incident[] = new Array();
  requested: number;
  assigned: number;
  pickedUp: number;
  rescued: number;
  missionRoutes: MissionRoute[] = new Array();
  shelters: Shelter[];

  constructor(
    private messageService: MessageService,
    private incidentService: IncidentService,
    private responderService: ResponderService,
    private shelterService: ShelterService,
    private missionService: MissionService
  ) { }

  togglePolling() {
    this.isPolling = !this.isPolling;

    if (this.isPolling === true) {
      this.polling = interval(this.interval).subscribe(n => {
        this.load();
      });
    } else {
      this.polling.unsubscribe();
    }
  }

  load() {
    this.requested = 0;
    this.assigned = 0;
    this.pickedUp = 0;
    this.rescued = 0;
    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);

    this.missionService.getMissions().subscribe((missions: Mission[]) => {
      this.handleMissions(missions);
      this.incidentService.getReported().subscribe((incidents: Incident[]) => this.handleIncidents(incidents));
      this.responderService.getAvailable().subscribe((allAvailable: Responder[]) => this.handleResponders(allAvailable));
    });
  }

  private handleMissions(missions: Mission[]): void {
    missions.forEach((mission: Mission) => {
      const status = mission.status;

      switch (status) {
        case 'CREATED': {
          this.assigned++;
          this.missionCreated(mission);
          break;
        }
        case 'UPDATED': {
          this.pickedUp++;
          this.missionUpdated(mission);
          break;
        }
        case 'COMPLETED': {
          this.rescued++;
          this.missionCompleted(mission);
          break;
        }
        default: {
          this.messageService.warning(`status: '${status}' is not a known code`);
          break;
        }
      }
    });
  }

  private missionCreated(mission: Mission): void {
    this.incidents.push({
      missionId: mission.id,
      id: mission.incidentId,
      lat: mission.incidentLat,
      lon: mission.incidentLong,
      status: mission.status
    });

    this.responders.push({
      missionId: mission.id,
      id: mission.responderId,
      lat: mission.responderStartLat,
      lon: mission.responderStartLong,
      missionStatus: mission.status
    });

    if (mission.route && mission.route.steps) {
      this.addRoute(mission.id, mission.route.steps);
    }
  }

  private missionUpdated(mission: Mission): void {
    this.responders.push({
      missionId: mission.id,
      id: mission.responderId,
      lat: mission.responderStartLat,
      lon: mission.responderStartLong,
      missionStatus: mission.status
    });
    if (mission.route && mission.route.steps.length > 0) {
      this.addRoute(mission.id, mission.route.steps);
    }
  }

  private missionCompleted(mission: Mission): void {
    this.shelters = this.shelters.map(shelter => {
      if (shelter.lon === mission.destinationLong && shelter.lat === mission.destinationLat) {
        shelter.rescued++;
      }
      return shelter;
    });
  }

  private addRoute(id: string, steps: any): void {
    const missionRoute: MissionRoute = {
      id: id,
      assignRoute: [],
      deliverRoute: []
    };
    let foundWayPoint = false;
    steps.forEach((step: any) => {
      if (foundWayPoint) {
        missionRoute.deliverRoute.push([step.loc.long, step.loc.lat]);
      } else {
        missionRoute.assignRoute.push([step.loc.long, step.loc.lat]);
      }
      if (step.wayPoint) {
        foundWayPoint = true;
      }
    });
    this.missionRoutes.push(missionRoute);
  }

  private handleIncidents(incidents: Incident[]): void {
    incidents.forEach(incident => {
      this.incidents.push(incident);
      this.requested++;
    });

    this.incidentStatus.assigned = this.assigned;
    this.incidentStatus.pickedUp = this.pickedUp;
    this.incidentStatus.requested = this.requested;
    this.incidentStatus.rescued = this.rescued;
    this.incidentStatus.total = this.incidentStatus.requested + this.incidentStatus.rescued + this.incidentStatus.assigned + this.incidentStatus.pickedUp;
    this.incidentStatus.percent = (this.incidentStatus.rescued / this.incidentStatus.total) * 100;
  }

  private handleResponders(allAvailable: Responder[]): void {
    const total = allAvailable.length;
    const active = this.assigned + this.pickedUp;
    this.responderStatus = {
      active: active,
      total: total,
      idle: total - active,
      data: [active, total - active]
    };

    this.responders.forEach((responder: Responder) => {
      const found = allAvailable.find((available: Responder) => {
        return responder.id === available.id;
      });
      if (found) {
        responder.name = found.name;
        responder.phoneNumber = found.phoneNumber;
        responder.medicalKit = found.medicalKit;
        responder.boatCapacity = found.boatCapacity;
        responder.person = found.person;
      }
    });
  }

  ngOnInit() {
    this.load();
  }
}
