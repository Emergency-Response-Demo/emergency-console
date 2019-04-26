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

  doAvailable(): void {
    this.isLoading = true;
    this.responder.available = true;

    this.responderService.update(this.responder).subscribe(() => this.messageService.success('Waiting to receive a rescue mission'));
    setTimeout(() => {
      this.missionService.getByResponder(this.responder).subscribe((mission: Mission) => {
        if (mission === null) {
          this.messageService.info('There is no mission available at this time');
        } else {
          this.messageService.success(`You have been assigned mission ${mission.id}`);
          this.incident.lon = mission.incidentLong;
          this.incident.lat = mission.incidentLat;
          this.missionStatus = mission.status;
          this.assignPaint['line-color'] = this.RED;
          this.assignPaint = { ...this.assignPaint };
          this.incidentStyle['background-image'] = 'url(assets/img/marker-red.svg)';

          let foundWayPoint = false;
          mission.route.steps.forEach((step: any) => {
            if (foundWayPoint) {
              this.deliverData.features[0].geometry.coordinates.push([step.loc.long, step.loc.lat]);
            } else {
              this.assignData.features[0].geometry.coordinates.push([step.loc.long, step.loc.lat]);
            }
            if (step.wayPoint) {
              foundWayPoint = true;
            }
          });
          this.deliverData = { ...this.deliverData };
          this.assignData = { ...this.assignData };
          this.bounds = AppUtil.getBounds(this.assignData.features[0].geometry.coordinates.concat(this.deliverData.features[0].geometry.coordinates));
          this.isLoading = false;
        }
      });
    }, 11000);
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
        this.responder.longitude = coordinates[0][0];
        this.responder.latitude = coordinates[0][1];
        coordinates.shift();
        this.locationRecurse(coordinates);
      }, 2000);
    }
  }

  doPickedUp(): void {
    this.missionStatus = 'Picked Up';
    this.messageService.info('Victim picked up');
    this.incident = new Incident();
    this.inRecursion = true;
    this.locationRecurse(this.deliverData.features[0].geometry.coordinates);
  }

  doRescued(): void {
    this.missionStatus = null;
    this.responder.longitude = 0;
    this.responder.latitude = 0;
    this.assignData.features[0].geometry.coordinates = [];
    this.assignData = { ...this.assignData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };

    // Reset responder account
    this.responder.available = false;
    this.responder.latitude = null;
    this.responder.longitude = null;
    this.responderService.update(this.responder).subscribe(() => this.messageService.success('Victim rescued'));
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat && this.missionStatus === null) {
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
            this.responder.longitude = null;
            this.responder.latitude = null;
          });
        });
      }
    });
    this.shelterService.getShelters().subscribe((shelters: Shelter[]) => this.shelters = shelters);
  }
}
