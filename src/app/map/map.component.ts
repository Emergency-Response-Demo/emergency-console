import { Component, OnInit, Input } from '@angular/core';
import { Incident } from '../models/incident';
import { Responder } from '../models/responder';
import { Shelter } from '../models/shelter';
import { IncidentStatus } from '../models/incident-status';
import { LineLayout, LinePaint, LngLatBoundsLike, FitBoundsOptions } from 'mapbox-gl';
import { MissionRoute } from '../models/mission-route';
import { AppUtil } from '../app-util';
import { ResponderService } from '../services/responder.service';
import { IncidentService } from '../services/incident.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() responders: Responder[];
  @Input() incidents: Incident[];
  @Input() shelters: Shelter[];
  @Input() missionRoutes: MissionRoute[];

  stats: IncidentStatus;

  center: number[] = [-77.886765, 34.210383];
  accessToken: string = window['_env'].accessToken;

  pickupData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  deliverData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();

  bounds: LngLatBoundsLike;
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };

  lineLayout: LineLayout = {
    'line-join': 'round',
    'line-cap': 'round'
  };

  readonly GREY = '#a4b7c1';
  readonly YELLOW = '#ffc107';
  readonly BLUE = '#20a8d8';
  readonly RED = '#f86c6b';
  readonly GREEN = '#4dbd74';

  pickupPaint: LinePaint = {
    'line-color': this.YELLOW,
    'line-width': 8
  };

  deliverPaint: LinePaint = {
    'line-color': this.BLUE,
    'line-width': 8
  };

  shelterStyle: any = {
    'background-image': 'url(assets/img/shelter.svg)'
  };

  constructor(public responderService: ResponderService, public incidentService: IncidentService) { }

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIncidentIcon(missionStatus: string): string {
    return (missionStatus === 'REPORTED' ? 'marker-red.svg' : 'marker-yellow.svg');
  }

  getResponderIcon(person: boolean): string {
    return (person ? 'responder-person.svg' : 'responder.svg');
  }

  onResponderPopup(responderId: number, index: number, missionId: string): void {
    this.responderService.getById(responderId).subscribe((responder: Responder) => {
      if (responder != null) {
        this.responders[index].name = responder.name;
        this.responders[index].phoneNumber = responder.phoneNumber;
        this.responders[index].boatCapacity = responder.boatCapacity;
        this.responders[index].medicalKit = responder.medicalKit;
        this.responders[index].person = responder.person;
      }
    });
    this.onPopup(missionId);
  }

  onIncidentPopup(incidentId: string, index: number, missionId: string): void {
    // this.incidentService.getById(incidentId).subscribe((incident: Incident) => {
    //   if (incident != null) {
    //     this.incidents[index].victimName = incident.victimName;
    //     this.incidents[index].victimPhoneNumber = incident.victimPhoneNumber;
    //     this.incidents[index].medicalNeeded = incident.medicalNeeded;
    //     this.incidents[index].numberOfPeople = incident.numberOfPeople;
    //   }
    // });
    this.onPopup(missionId);
  }

  private onPopup(id: string): void {
    this.pickupData.features[0].geometry.coordinates = [];
    this.pickupData = { ...this.pickupData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };

    if (id) {
      const missionRoute = this.missionRoutes.find((route: MissionRoute) => route.id === id);
      if (missionRoute) {
        this.pickupData.features[0].geometry.coordinates = missionRoute.pickupRoute;
        this.deliverData.features[0].geometry.coordinates = missionRoute.deliverRoute;
        this.pickupData = { ...this.pickupData };
        this.deliverData = { ...this.deliverData };
        this.bounds = AppUtil.getBounds(missionRoute.pickupRoute.concat(missionRoute.deliverRoute));
      }
    }
  }

  ngOnInit() {
  }
}
