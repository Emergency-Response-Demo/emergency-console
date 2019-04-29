import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { AppUtil } from '../app-util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  refreshIcon: IconDefinition = faSync;
  stopIcon: IconDefinition = faBan;
  polling: any;
  interval: number = Number(window['_env'].pollingInterval) || 10000;
  isPolling = false;
  incidentStatus: IncidentStatus = new IncidentStatus();
  responderStatus: ResponderStatus;

  // use final variables as double buffer and prevent page flicker
  responders: Responder[] = new Array();
  finalResponders: Responder[] = new Array();

  incidents: Incident[] = new Array();
  finalIncidents: Incident[] = new Array();

  missionRoutes: MissionRoute[] = new Array();
  finalMissionRoutes: MissionRoute[] = new Array();

  requested: number;
  assigned: number;
  pickedUp: number;
  rescued: number;

  shelters: Shelter[] = new Array();

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
    // init
    this.requested = 0;
    this.assigned = 0;
    this.pickedUp = 0;
    this.rescued = 0;
    this.missionRoutes = new Array();
    this.incidents = new Array();
    this.responders = new Array();

    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);

    this.missionService.getMissions().subscribe((missions: Mission[]) => {
      this.handleMissions(missions);
      this.finalMissionRoutes = this.missionRoutes;
      this.incidentService.getReported().subscribe((incidents: Incident[]) => {
        this.handleIncidents(incidents);
        this.finalIncidents = this.incidents;
      });
      this.responderService.getTotal().subscribe((stats: any) => {
        this.handleResponders(stats);
        this.finalResponders = this.responders;
      });
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
      latitude: mission.responderStartLat,
      longitude: mission.responderStartLong,
      missionStatus: mission.status
    });

    if (mission.route && mission.route.steps) {
      const missionRoute: MissionRoute = AppUtil.getRoute(mission.id, mission.route.steps);

      this.missionRoutes.push(missionRoute);
    }
  }

  private missionUpdated(mission: Mission): void {
    this.responders.push({
      missionId: mission.id,
      id: mission.responderId,
      latitude: mission.responderStartLat,
      longitude: mission.responderStartLong,
      missionStatus: mission.status
    });
    if (mission.route && mission.route.steps.length > 0) {
      const missionRoute: MissionRoute = AppUtil.getRoute(mission.id, mission.route.steps);
      this.missionRoutes.push(missionRoute);
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

  private handleResponders(stats: any): void {
    const total = stats.total;
    const active = this.assigned + this.pickedUp;
    this.responderStatus = {
      active: active,
      total: total,
      idle: total - active,
      data: [active, total - active]
    };
  }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.polling) {
      this.polling.unsubscribe();
    }
  }
}
