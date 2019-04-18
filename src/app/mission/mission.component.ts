import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from '../responder';
import { MapMouseEvent, LngLatBoundsLike, LngLat, FitBoundsOptions, LinePaint, LineLayout, Map } from 'mapbox-gl';
import { MissionService } from './mission.service';
import { AppUtil } from '../app-util';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss']
})
export class MissionComponent implements OnInit {
  map: Map;
  isLoading = false;
  loadingIcon: IconDefinition = faCircleNotch;
  model: Responder = new Responder();
  center: LngLat = new LngLat(-77.886765, 34.210383);
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  data: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  start: LngLat;
  incident: LngLat;
  shelter: LngLat = new LngLat(-77.949, 34.1706);
  bounds: LngLatBoundsLike;
  missionStatus: string = null;

  readonly GREY = '#a4b7c1';
  readonly YELLOW = '#ffc107';
  readonly BLUE = '#20a8d8';
  readonly RED = '#f86c6b';
  readonly GREEN = '#4dbd74';

  startStyle: any = {
    'background-image': 'url(assets/img/location.svg)'
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
  linePaint: LinePaint = {
    'line-color': this.GREY,
    'line-width': 8
  };

  constructor(private messageService: MessageService, private keycloak: KeycloakService, private missionService: MissionService) {}

  private setDirections(): void {
    setTimeout(() => {
      this.missionService.getDirections(this.start, this.incident, this.shelter).subscribe(res => {
        const coordinates = res.routes[0].geometry.coordinates;
        this.data.features[0].geometry.coordinates = coordinates;
        this.data = { ...this.data };
        this.bounds = AppUtil.getBounds(coordinates);
        this.linePaint = { ...this.linePaint };
        this.isLoading = false;
      });
    }, 1000);
  }

  doAvailable(): void {
    this.isLoading = true;
    this.missionStatus = 'Available';
    this.messageService.info('You are now available to receive a rescue mission');
    this.incidentStyle['background-image'] = 'url(assets/img/marker-red.svg)';
    this.incident = new LngLat(-77.94346099447226, 34.21828123440535);
    this.linePaint['line-color'] = this.RED;

    this.setDirections();
  }

  doStart(): void {
    this.messageService.info('Mission started');
    this.missionStatus = 'Start';
    this.linePaint['line-color'] = this.YELLOW;
    this.linePaint = { ...this.linePaint };
    this.incidentStyle['background-image'] = 'url(assets/img/marker-yellow.svg)';
  }

  doPickedUp(): void {
    this.isLoading = true;
    this.missionStatus = 'Picked Up';
    this.messageService.info('Victim picked up');
    this.linePaint['line-color'] = this.BLUE;
    this.start = this.incident;
  }

  doRescued(): void {
    this.messageService.success('Victim rescued');
    this.missionStatus = null;
    this.linePaint['line-color'] = this.GREY;
    this.start = null;
    this.data.features[0].geometry.coordinates = [];
    this.data = { ...this.data };
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat && this.missionStatus === null) {
      this.start = event.lngLat;
    }
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          this.model.name = `${profile.firstName} ${profile.lastName}`;
          this.model.phoneNumber = profile['attributes'].phoneNumber;
          this.model.boatCapacity = profile['attributes'].boatCapacity;
          this.model.medicalKit = profile['attributes'].medical;
        });
      }
    });
  }
}
