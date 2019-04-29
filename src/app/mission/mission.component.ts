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

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss']
})
export class MissionComponent implements OnInit {
  map: Map;
  stepTime = 10000;
  isLoading = false;
  loadingIcon: IconDefinition = faCircleNotch;
  responder: Responder = new Responder();
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
  inRecursion = false;

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
    private responderService: ResponderService
  ) { }

  doAvailable(): void {
    this.isLoading = true;
    this.responder.available = true;

    this.responderService.update(this.responder).subscribe(() => this.messageService.success('Waiting to receive a rescue mission'));

    // wait 61 seconds then ask for a mission
    setTimeout(() => {
      this.getMission();
    }, 20000);
  }

  private getMission(): void {

    this.missionService.getByResponder(this.responder).subscribe((mission: Mission) => {
      if (mission === null || mission.status === 'COMPLETED') {
        this.messageService.info('There is no mission available at this time');
      } else {
        this.messageService.success(`You have been assigned mission ${mission.id}`);
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
      }
      this.isLoading = false;
    });

  }

  doStart(): void {
    this.messageService.info('Mission started');
    this.missionStatus = 'CREATED';
    this.pickupPaint['line-color'] = this.YELLOW;
    this.pickupPaint = { ...this.pickupPaint };
    this.incidentStyle['background-image'] = 'url(assets/img/marker-yellow.svg)';
    this.inRecursion = true;
    this.locationRecurse(this.pickupData.features[0].geometry.coordinates);
  }

  private locationRecurse(coordinates: number[][]): void {
    if (coordinates.length < 1) {
      this.inRecursion = false;
      return;
    } else {
      setTimeout(() => {
        this.responder.longitude = coordinates[0][0];
        this.responder.latitude = coordinates[0][1];
        coordinates.shift();
        this.locationRecurse(coordinates);
      }, this.stepTime);
    }
  }

  doPickedUp(): void {
    this.missionStatus = 'UPDATED';
    this.messageService.info('Victim picked up');
    this.incident = new Incident();
    this.inRecursion = true;
    this.locationRecurse(this.deliverData.features[0].geometry.coordinates);
  }

  doRescued(): void {
    this.missionStatus = 'CREATED';
    this.pickupData.features[0].geometry.coordinates = [];
    this.pickupData = { ...this.pickupData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat && this.missionStatus === null && !this.isLoading) {
      this.responder.longitude = event.lngLat.lng;
      this.responder.latitude = event.lngLat.lat;
    }
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          const name = `${profile.firstName} ${profile.lastName}`;
          this.responderService.getByName(name).subscribe((responder: Responder) => {
            this.responder = responder;
          });
        });
      }
    });
    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);
    setTimeout(() => {
      this.getMission();
    }, 500);

  }
}
