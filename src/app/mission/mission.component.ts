import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from './responder';
import { MapMouseEvent, LngLatBoundsLike, LngLat, FitBoundsOptions, LinePaint, LineLayout } from 'mapbox-gl';
import { MissionService } from './mission.service';
import { AppUtil } from '../app-util';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent implements OnInit {
  model: Responder = new Responder();
  center: LngLat = new LngLat(-77.886765, 34.210383);
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  data: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    ]
  };
  start: LngLat;
  end: LngLat;
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
  endStyle: any = {
    'background-image': 'url(assets/img/marker-red.svg)'
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

  doAvailable(): void {
    this.missionStatus = 'Available';
    this.messageService.info('You are now available to receive a rescue mission');
    this.endStyle['background-image'] = 'url(assets/img/marker-red.svg)';
    this.end = new LngLat(-77.94346099447226, 34.21828123440535);

    this.missionService.getDirections(this.start, this.end).subscribe(res => {
      const coordinates = res.routes[0].geometry.coordinates;
      this.data.features[0].geometry.coordinates = coordinates;
      this.data = { ...this.data };
      this.bounds = AppUtil.getBounds(coordinates);
      this.linePaint['line-color'] = this.RED;
      this.linePaint = { ...this.linePaint };
    });
  }

  doStart(): void {
    this.messageService.info('Mission started');
    this.missionStatus = 'Start';
    this.linePaint['line-color'] = this.YELLOW;
    this.linePaint = { ...this.linePaint };
    this.endStyle['background-image'] = 'url(assets/img/marker-yellow.svg)';
  }

  doPickedUp(): void {
    this.messageService.info('Victim picked up');
    this.missionStatus = 'Picked Up';

    this.start = this.end;
    this.end = new LngLat(-77.949, 34.1706);
    this.endStyle['background-image'] = 'url(assets/img/marker-blue.svg)';

    this.missionService.getDirections(this.start, this.end).subscribe(res => {
      const coordinates = res.routes[0].geometry.coordinates;
      this.data.features[0].geometry.coordinates = coordinates;
      this.data = { ...this.data };
      this.bounds = AppUtil.getBounds(coordinates);
      this.linePaint['line-color'] = this.BLUE;
      this.linePaint = { ...this.linePaint };
    });
  }

  doRescued(): void {
    this.messageService.success('Victim rescued');
    this.missionStatus = null;
    this.linePaint['line-color'] = this.GREY;
    this.start = null;
    this.endStyle['background-image'] = 'url(assets/img/marker-green.svg)';
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
          this.model.fullName = `${profile.firstName} ${profile.lastName}`;
          this.model.phoneNumber = profile['attributes'].phoneNumber;
          this.model.boatCapacity = profile['attributes'].boatCapacity;
          this.model.medical = profile['attributes'].medical;
        });
      }
    });
  }
}
