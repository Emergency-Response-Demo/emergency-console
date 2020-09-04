import { Component, OnInit, OnDestroy } from '@angular/core';
import { IconDefinition, faSync, faBan } from '@fortawesome/free-solid-svg-icons';
import { IncidentStatus } from '../models/incident-status';
import { Shelter } from '../models/shelter';
import { Responder } from '../models/responder';
import { Incident } from '../models/incident';
import { IncidentService } from '../services/incident.service';
import { ResponderService } from '../services/responder.service';
import { Mission } from '../models/mission';
import { ResponderStatus, ResponderTotalStatus, ResponderLocationStatus } from '../models/responder-status';
import { DisasterService } from '../services/disaster.service';
import { MissionService } from '../services/mission.service';
import { IncidentPriorityService } from '../services/incident-priority.service';
import { PriorityZone } from '../models/priority-zone';
import { Socket } from 'ngx-socket-io';
import { DisasterCenter } from '../models/disaster-center';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  refreshIcon: IconDefinition = faSync;
  stopIcon: IconDefinition = faBan;

  // Use maps here to speed up access on large sets.
  responderMap = new Map<string, Responder>();
  missionMap = new Map<string, Mission>();
  incidentMap = new Map<string, Incident>();

  priorityZones: PriorityZone[] = new Array();
  shelters: Shelter[] = new Array();
  totalResponders = 0;

  displayKickstart: boolean;

  center: DisasterCenter;

  incidentCommander: boolean;

  constructor(
    private incidentService: IncidentService,
    private responderService: ResponderService,
    private disasterService: DisasterService,
    private missionService: MissionService,
    private incidentPriorityService: IncidentPriorityService,
    private socket: Socket,
    private keycloak: KeycloakService
  ) { }

  async load(): Promise<void> {
    return Promise.all([
      this.missionService.getMissions(),
      this.incidentService.getAll(),
      this.disasterService.getShelters(),

      // https://trello.com/c/Dlr5jK7G/179-responders-not-showing-metadata
      //this.responderService.getAvailable(),
      this.responderService.getAllResponders(),

      this.incidentPriorityService.getPriorityZones(),
      this.disasterService.getDisasterCenter(),
      this.responderService.getTotal()])
      .then(([missions, incidents, shelters, responders, priorityZones, disasterCenter, responderStatus]: [Mission[], Incident[], Shelter[], Responder[], PriorityZone[], DisasterCenter, ResponderTotalStatus]) => {
        this.shelters = shelters;
        this.priorityZones = priorityZones;
        this.center = disasterCenter;

        // Use temp values so we have a double buffer, avoid needless updates.
        const tempIncidents = new Map<string, Incident>();
        incidents.forEach(m => tempIncidents[m.id] = m);
        this.incidentMap = tempIncidents;

        const tempMissions = new Map<string, Mission>();
        const tempResponders = new Map<string, Responder>();
        missions.forEach(m => {
          tempMissions[m.id] = m;
          const tempResponder = this.buildResponderFromMission(m);
          if (tempResponder && m.status !== 'COMPLETED') {
            tempResponders[m.responderId] = tempResponder;
          }
          if (m.status === 'COMPLETED') {
            this.handleMissionComplete(m);
          }
        });
        this.missionMap = tempMissions;

        // Override any responders that we can get real information for.
        responders.forEach(r => tempResponders[r.id] = r);
        this.responderMap = tempResponders;
        this.totalResponders = responderStatus.total;
      });
  }

  get incidentStatus(): IncidentStatus {
    const incidentStatus = new IncidentStatus();
    this.incidents.forEach(i => {
      if (i.status === 'REPORTED') {
        incidentStatus.requested++;
      } else if (i.status === 'ASSIGNED') {
        incidentStatus.assigned++;
      } else if (i.status === 'PICKEDUP') {
        incidentStatus.pickedUp++;
      } else if (i.status === 'RESCUED') {
        incidentStatus.rescued++;
      }
    });
    this.displayKickstart = incidentStatus.requested == 0 && incidentStatus.assigned == 0 && incidentStatus.pickedUp == 0;
    return incidentStatus;
  }

  get responderStatus(): ResponderStatus {
    const responderStatus = new ResponderStatus();

    responderStatus.active = this.missions.filter(m => m.status !== 'COMPLETED').length;
    if (this.totalResponders < responderStatus.active) {
      this.totalResponders = responderStatus.active;
    }
    responderStatus.idle = this.totalResponders - responderStatus.active;
    return responderStatus;
  }

  get responders(): Responder[] {
    return Object.values(this.responderMap);
  }

  get activeResponders(): Responder[] {
    return this.missions.filter(m => m.status !== 'COMPLETED').map(m => this.responderMap[m.responderId]).filter(r => !!r);
  }

  get missions(): Mission[] {
    return Object.values(this.missionMap);
  }

  get incidents(): Incident[] {
    return Object.values(this.incidentMap);
  }

  private handleIncidentUpdate(incident: Incident): void {
    const currentIncident = this.incidentMap[incident.id];
    this.incidentMap[incident.id] = Object.assign({ status: 'REPORTED' }, currentIncident, incident);
  }

  private handleResponderUpdate(responder: Responder): void {
    const currentResponder = this.responderMap[responder.id];
    this.responderMap[responder.id] = Object.assign({}, currentResponder, responder);
  }

  private handleResponderCreate(responder: Responder): void {
    const currentResponder = this.responderMap[responder.id];
    this.responderMap[responder.id] = Object.assign({}, currentResponder, responder);
    this.totalResponders = Object.values(this.responderMap).length;
  }

  private handleResponderDelete(responderId: string): void {
    delete this.responderMap[responderId];
    this.totalResponders = Object.values(this.responderMap).length;
  }

  private handleResponderLocationUpdate(update: ResponderLocationStatus): void {
    if (!this.responderMap[update.responderId]) {
      return;
    }
    this.responderMap[update.responderId].latitude = update.lat;
    this.responderMap[update.responderId].longitude = update.lon;
    this.responderMap[update.responderId].person = update.human;
  }

  private handleMissionUpdate(mission: Mission): void {
    if (mission.status === 'COMPLETED') {
      this.handleMissionComplete(mission);
    }
    this.missionMap[mission.id] = mission;
  }

  private handleMissionComplete(mission: Mission): void {
    if (mission.status !== 'COMPLETED') {
      return;
    }
    this.shelters = this.shelters.map(s => {
      if (mission.destinationLat === s.lat && mission.destinationLong === s.lon) {
        s.rescued++;
      }
      return s;
    });
  }

  private buildResponderFromMission(mission: Mission): Responder {
    if (!mission.responderLocationHistory || mission.responderLocationHistory.length < 1) {
      return null;
    }
    const lastLocation = mission.responderLocationHistory[mission.responderLocationHistory.length - 1];

    const responder = new Responder();
    responder.id = mission.responderId;
    responder.latitude = lastLocation.lat;
    responder.longitude = lastLocation.lon;
    return responder;
  }

  async ngOnInit() {
    await this.load();
    this.missionService.watch().subscribe(this.handleMissionUpdate.bind(this));
    this.incidentService.watch(['IncidentReportedEvent', 'UpdateIncidentCommand']).subscribe(this.handleIncidentUpdate.bind(this));
    this.responderService.watch().subscribe(this.handleResponderUpdate.bind(this));
    this.responderService.watchCreates().subscribe(this.handleResponderCreate.bind(this));
    this.responderService.watchDeletes().subscribe(this.handleResponderDelete.bind(this));
    this.responderService.watchLocation().subscribe(this.handleResponderLocationUpdate.bind(this));

    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.incidentCommander = this.keycloak.isUserInRole('incident_commander');
      }
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }
}
