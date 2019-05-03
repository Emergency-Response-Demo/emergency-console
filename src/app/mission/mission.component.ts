import { Component, OnInit } from '@angular/core';
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
import { Mission } from '../models/mission';
import { ResponderSimulatorService } from '../services/responder-simulator.service';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss']
})
export class MissionComponent implements OnInit {
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
    'background-image': 'url(assets/img/marker-red.svg)'
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
    private responderSimulatorService: ResponderSimulatorService
  ) { }

  doAvailable(): void {
    this.isLoading = true;
    this.responder.enrolled = true;
    this.responder.available = true;
    this.responderService.update(this.responder).subscribe(() => this.messageService.success('Waiting to receive a rescue mission'));
  }

  doPickedUp(): void {
    this.responder.available = true;
    this.responder.enrolled = false;
    this.responderService.update(this.responder).subscribe(() => {
      this.responderSimulatorService.updateStatus(this.mission, 'PICKEDUP').subscribe(() => this.messageService.info('Pick up complete'));
    });
  }

  getCurrentMissionStep(): any {
    if (!this.mission || !this.mission.route || !this.mission.route.steps || !this.responder) {
      return null;
    }
    return this.mission.route.steps.find((step: any) => {
      return step.loc.lat === this.responder.latitude && step.loc.long === this.responder.longitude;
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

  handleMissionStatusUpdate(mission: Mission): void {
    if (mission === null || mission.status === 'COMPLETED') {
      this.messageService.success('Mission complete');
      this.isLoading = false;
      this.missionStatus = null;
      return;
    }
    if (mission.status === 'CREATED') {
      this.messageService.success(`You have been assigned mission ${mission.id}`);
      this.responderSimulatorService.updateStatus(mission, 'MOVING').subscribe(() => this.messageService.info('Mission started'));
    }
    this.mission = mission;

    this.incident.lon = mission.incidentLong;
    this.incident.lat = mission.incidentLat;
    this.missionStatus = mission.status;
    this.pickupPaint['line-color'] = this.RED;
    this.pickupPaint = { ...this.pickupPaint };
    this.incidentStyle['background-image'] = 'url(assets/img/marker-red.svg)';

    const mapRoute = AppUtil.getRoute(mission.id, mission.route.steps);

    this.deliverData.features[0].geometry.coordinates = mapRoute.deliverRoute;
    this.deliverData = { ...this.deliverData };

    this.pickupData.features[0].geometry.coordinates = mapRoute.pickupRoute;
    this.pickupData = { ...this.pickupData };

    this.bounds = AppUtil.getBounds(mapRoute.pickupRoute.concat(mapRoute.deliverRoute));
    this.isLoading = false;
  }

  handleResponderLocationUpdate(update: any): void {
    // TODO: Set enrolled to false when status === DROPPED.
    if (update === null) {
      return;
    }
    this.responder.longitude = update.location.long;
    this.responder.latitude = update.location.lat;
  }

  handleResponderLocationFromMission(mission: Mission): void {
    if (!mission || !mission.responderLocationHistory || !this.responder) {
      return;
    }
    const lastLocation = mission.responderLocationHistory[mission.responderLocationHistory.length - 1];
    if (!lastLocation) {
      return;
    }
    this.responder.latitude = lastLocation.location.lat;
    this.responder.longitude = lastLocation.location.long;
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          const name = `${profile.firstName} ${profile.lastName}`;
          this.responderService.getByName(name).subscribe((responder: Responder) => {
            this.responder = responder;
            // Watch missions filtered by the current responders ID.
            this.missionService.watchByResponder(responder).subscribe(this.handleMissionStatusUpdate.bind(this));
            // Watch for location update events on the current responder.
            this.responderService.watchLocation(responder).subscribe(this.handleResponderLocationUpdate.bind(this));
            // Check whether a mission is already in progress.
            this.missionService.getByResponder(responder).subscribe(mission => {
              this.handleMissionStatusUpdate(mission);
              this.handleResponderLocationFromMission(mission);
            });
          });
        });
      }
    });
    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);
  }
}
