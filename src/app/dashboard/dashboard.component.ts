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
import { ShelterService } from '../services/shelter.service';
import { MissionService } from '../services/mission.service';
import { Socket } from 'ngx-socket-io';

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

  shelters: Shelter[] = new Array();
  totalResponders = 0;

  constructor(
    private incidentService: IncidentService,
    private responderService: ResponderService,
    private shelterService: ShelterService,
    private missionService: MissionService,
    private socket: Socket
  ) { }

  async load(): Promise<void> {
    return Promise.all([
      this.missionService.getMissions(),
      this.incidentService.getAll(),
      this.shelterService.getShelters(),
      this.responderService.getAvailable(),
      this.responderService.getTotal()])
      .then(([missions, incidents, shelters, responders, responderStatus]: [Mission[], Incident[], Shelter[], Responder[], ResponderTotalStatus]) => {
        this.shelters = shelters;

        const tempIncidents = new Map<string, Incident>();
        incidents.forEach(m => tempIncidents[m.id] = m);
        this.incidentMap = tempIncidents;
        // Use a temp map so we don't trigger a UI update on each update to
        // this.missionsMap.
        const tempMissions = new Map<string, Mission>();
        missions.forEach(m => tempMissions[m.id] = m);
        this.missionMap = tempMissions;
        // Do the same again for responders.
        const tempResponders = new Map<string, Responder>();
        responders.forEach(r => tempResponders[r.id] = r);
        this.responderMap = tempResponders;
        this.totalResponders = responderStatus.total;
      });
  }

  get incidentStatus(): IncidentStatus {
    const incidentStatus = new IncidentStatus();

    this.missions.forEach(m => {
      if (m.status === 'CREATED') {
        incidentStatus.assigned++;
      } else if (m.status === 'UPDATED') {
        incidentStatus.pickedUp++;
      } else if (m.status === 'COMPLETED') {
        incidentStatus.rescued++;
      }
    });
    const inProgress = (incidentStatus.assigned + incidentStatus.pickedUp + incidentStatus.rescued);
    incidentStatus.requested = this.incidents.length - inProgress;
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


  get missions(): Mission[] {
    return Object.values(this.missionMap);
  }

  get incidents(): Incident[] {
    return Object.values(this.incidentMap);
  }

  private handleIncidentUpdate(incident: Incident): void {
    const currentIncident = this.incidentMap[incident.id];
    this.incidentMap[incident.id] = Object.assign({}, currentIncident, incident);
  }

  private handleResponderUpdate(responder: Responder): void {
    const currentResponder = this.responderMap[responder.id];
    this.responderMap[responder.id] = Object.assign({}, currentResponder, responder);
  }

  private handleResponderLocationUpdate(update: ResponderLocationStatus): void {
    if (!this.responderMap[update.responderId]) {
      return;
    }
    this.responderMap[update.responderId].latitude = update.lat;
    this.responderMap[update.responderId].longitude = update.lon;
  }

  private handleMissionUpdate(mission: Mission): void {
    if (mission.status === 'COMPLETED') {
      const shelterIdx = this.shelters.findIndex(s => s.lat === mission.destinationLat && s.lon === mission.destinationLong);
      this.shelters[shelterIdx].rescued++;
    }
    this.missionMap[mission.id] = mission;
  }

  async ngOnInit() {
    await this.load();
    this.missionService.watch().subscribe(this.handleMissionUpdate.bind(this));
    this.incidentService.watch(['IncidentReportedEvent', 'UpdateIncidentCommand']).subscribe(this.handleIncidentUpdate.bind(this));
    this.responderService.watch().subscribe(this.handleResponderUpdate.bind(this));
    this.responderService.watchLocation().subscribe(this.handleResponderLocationUpdate.bind(this));
  }

  ngOnDestroy() {}
}
