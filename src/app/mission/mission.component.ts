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
  center: LngLat = new LngLat(-77.886765, 34.210383);
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  assignData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  deliverData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  incident: LngLat;
  bounds: LngLatBoundsLike;
  missionStatus: string = null;
  shelters: Shelter[];
  inRecursion = false;

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
  deliverPaint: LinePaint = {
    'line-color': this.BLUE,
    'line-width': 8
  };
  assignPaint: LinePaint = {
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

  private setDirections(): void {
    setTimeout(() => {
      this.missionService.getDirections(this.responder, this.incident, this.shelters[0]).subscribe(res => {
        const coordinates: number[][] = res.routes[0].geometry.coordinates;
        const incidentIndex = coordinates.findIndex((entry: number[]) => {
          return entry[0] === res.waypoints[1].location[0] && entry[1] === res.waypoints[1].location[1];
        });
        this.assignData.features[0].geometry.coordinates = coordinates.slice(0, incidentIndex);
        this.assignData = { ...this.assignData };
        this.deliverData.features[0].geometry.coordinates = coordinates.slice(incidentIndex, coordinates.length);
        this.deliverData = { ...this.deliverData };
        this.bounds = AppUtil.getBounds(coordinates);
        this.isLoading = false;
      });
    }, 1000);
  }

  doAvailable(): void {
    this.isLoading = true;
    // Set available to true
    // ask mission service for mission MISSIONS_EP + "/responders/:id"
    this.missionStatus = 'Available';
    this.assignPaint['line-color'] = this.RED;
    this.assignPaint = { ...this.assignPaint };
    this.messageService.info('You are now available to receive a rescue mission');
    this.incidentStyle['background-image'] = 'url(assets/img/marker-red.svg)';
    this.incident = new LngLat(-77.94346099447226, 34.21828123440535);

    this.setDirections();
  }

  doStart(): void {
    this.messageService.info('Mission started');
    this.missionStatus = 'Start';
    this.assignPaint['line-color'] = this.YELLOW;
    this.assignPaint = { ...this.assignPaint };
    this.incidentStyle['background-image'] = 'url(assets/img/marker-yellow.svg)';
    this.inRecursion = true;
    this.locationRecurse(this.assignData.features[0].geometry.coordinates);
  }

  private locationRecurse(coordinates: number[][]): void {
    if (coordinates.length < 1) {
      this.inRecursion = false;
      return;
    } else {
      setTimeout(() => {
        this.responder.lon = coordinates[0][0];
        this.responder.lat = coordinates[0][1];
        coordinates.shift();
        this.locationRecurse(coordinates);
      }, 1000);
    }
  }

  doPickedUp(): void {
    this.missionStatus = 'Picked Up';
    this.messageService.info('Victim picked up');
    this.incident = null;
    this.inRecursion = true;
    this.locationRecurse(this.deliverData.features[0].geometry.coordinates);
  }

  doRescued(): void {
    this.messageService.success('Victim rescued');
    this.missionStatus = null;
    this.responder.lon = 0;
    this.responder.lat = 0;
    this.assignData.features[0].geometry.coordinates = [];
    this.assignData = { ...this.assignData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat && this.missionStatus === null) {
      this.responder.lon = event.lngLat.lng;
      this.responder.lat = event.lngLat.lat;
    }
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          const name = `${profile.firstName} ${profile.lastName}`;
          this.responderService.getByName(name).subscribe((responder: Responder) => this.responder = {...responder});
        });
      }
    });
    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);
  }
}
