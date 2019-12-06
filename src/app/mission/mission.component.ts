import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../services/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from '../models/responder';
import { MapMouseEvent, LngLatBoundsLike, LngLat, FitBoundsOptions, LinePaint, LineLayout, Map } from 'mapbox-gl';
import { MissionService } from '../services/mission.service';
import { AppUtil } from '../app-util';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Shelter } from '../models/shelter';
import { ShelterService } from '../services/shelter.service';
import { ResponderService } from '../services/responder.service';
import { Incident } from '../models/incident';
import { Mission, MissionStep } from '../models/mission';
import { ResponderSimulatorService } from '../services/responder-simulator.service';
import { Socket } from 'ngx-socket-io';
import { ResponderLocationStatus } from '../models/responder-status';
import { IncidentService } from '../services/incident.service';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss']
})
export class MissionComponent implements OnInit, OnDestroy {
  map: Map;
  isLoading = false;
  loadingIcon: IconDefinition = faCircleNotch;
  responder: Responder = new Responder();
  mission: Mission = new Mission();
  center: LngLat = new LngLat(-77.886765, 34.210383);
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  pickupData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  deliverData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  incident: Incident = new Incident();
  bounds: LngLatBoundsLike;
  missionStatus: string = null;
  shelters: Shelter[];

  readonly GREY = '#a4b7c1';
  readonly YELLOW = '#ffc107';
  readonly BLUE = '#20a8d8';
  readonly RED = '#f86c6b';
  readonly GREEN = '#4dbd74';

  responderStyle: any = {
    'background-image': 'url(assets/img/responder-person.svg)'
  };
  incidentStyle: any = {
    'background-image': 'url(assets/img/marker-yellow.svg)'
  };
  shelterStyle: any = {
    'background-image': 'url(assets/img/shelter.svg)'
  };
  lineLayout: LineLayout = {
    'line-join': 'round',
    'line-cap': 'round'
  };
  deliverPaint: LinePaint = {
    'line-color': this.BLUE,
    'line-width': 8
  };
  pickupPaint: LinePaint = {
    'line-color': this.GREY,
    'line-width': 8
  };

  constructor(
    private messageService: MessageService,
    private keycloak: KeycloakService,
    private missionService: MissionService,
    private shelterService: ShelterService,
    private responderService: ResponderService,
    private responderSimulatorService: ResponderSimulatorService,
    private incidentService: IncidentService,
    private socket: Socket
  ) { }

  async doAvailable(): Promise<void> {
    this.isLoading = true;
    this.responder.enrolled = true;
    this.responder.available = true;
    await this.responderService.update(this.responder); this.messageService.success('Waiting to receive a rescue mission');
  }

  async doPickedUp(): Promise<void> {
    await this.responderSimulatorService.updateStatus(this.mission, 'PICKEDUP');
  }

  getCurrentMissionStep(): any {
    if (!this.mission || !this.mission.steps || !this.responder) {
      return null;
    }
    return this.mission.steps.find((step: MissionStep) => {
      return step.lat === this.responder.latitude && step.lon === this.responder.longitude;
    });
  }

  onWaypoint(): boolean {
    const currentStep = this.getCurrentMissionStep();
    return currentStep ? currentStep.wayPoint : false;
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat && this.missionStatus === null && !this.isLoading) {
      this.responder.longitude = event.lngLat.lng;
      this.responder.latitude = event.lngLat.lat;
    }
  }

  async handleMissionStatusUpdate(mission: Mission, showMessages: boolean = true): Promise<void> {
    if (mission === null || mission.status === 'COMPLETED') {
      if (showMessages) {
        this.messageService.success('Mission complete');
      }
      this.isLoading = false;
      this.missionStatus = null;
      return;
    }
    if (mission.status === 'CREATED') {
      if (showMessages) {
        this.messageService.success(`You have been assigned mission ${mission.id}`);
      }
      this.responderSimulatorService.updateStatus(mission, 'MOVING');
    }
    this.mission = mission;

    this.incident.lon = mission.incidentLong;
    this.incident.lat = mission.incidentLat;
    this.incident.id = mission.incidentId;

    this.missionStatus = mission.status;
    this.pickupPaint['line-color'] = this.YELLOW;
    this.pickupPaint = { ...this.pickupPaint };
    this.incidentStyle['background-image'] = 'url(assets/img/marker-yellow.svg)';
    const mapRoute = AppUtil.getRoute(mission.id, mission.steps);

    this.deliverData.features[0].geometry.coordinates = mapRoute.deliverRoute;
    this.deliverData = { ...this.deliverData };

    this.pickupData.features[0].geometry.coordinates = mapRoute.pickupRoute;
    this.pickupData = { ...this.pickupData };

    this.bounds = AppUtil.getBounds(mapRoute.pickupRoute.concat(mapRoute.deliverRoute));
    this.isLoading = false;

    this.incident = await this.incidentService.getById(this.incident.id);
  }

  handleResponderLocationUpdate(update: ResponderLocationStatus): void {
    if (update === null) {
      return;
    }
    this.responder.longitude = update.lon;
    this.responder.latitude = update.lat;
  }

  handleResponderLocationFromMission(mission: Mission): void {
    if (!mission || !mission.responderLocationHistory || !this.responder) {
      return;
    }
    const lastLocation = mission.responderLocationHistory[mission.responderLocationHistory.length - 1];
    if (!lastLocation) {
      return;
    }
    this.responder.latitude = lastLocation.lat;
    this.responder.longitude = lastLocation.lon;
  }

  async ngOnInit() {
    const isLoggedIn = await this.keycloak.isLoggedIn();
    if (!isLoggedIn) {
      return;
    }
    const profile = await this.keycloak.loadUserProfile();
    const responderName = `${profile.firstName} ${profile.lastName}`;
    this.responder = await this.responderService.getByName(responderName);
    // Watch missions filtered by the current responders ID.
    this.missionService.watchByResponder(this.responder).subscribe(this.handleMissionStatusUpdate.bind(this));
    // Watch for location update events on the current responder.
    this.responderService.watchLocation(this.responder).subscribe(this.handleResponderLocationUpdate.bind(this));
    // Check whether a mission is already in progress.
    const currentMission = await this.missionService.getByResponder(this.responder);
    this.handleMissionStatusUpdate(currentMission, false);
    this.handleResponderLocationFromMission(currentMission);
    this.shelters = await this.shelterService.getShelters();
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }
}
