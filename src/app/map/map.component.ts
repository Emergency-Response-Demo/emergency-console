import { Component, OnInit, Input } from '@angular/core';
import { Incident } from '../incident';
import { Responder } from '../responder';
import { Shelter } from '../shelter';
import { IncidentStatus } from '../incident/incident-status';
import { LineLayout, LinePaint, LngLatBoundsLike, FitBoundsOptions } from 'mapbox-gl';
import { MissionRoute } from '../mission-route';
import { AppUtil } from '../app-util';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() responders: Responder[] = new Array();
  @Input() incidents: Incident[] = new Array();
  @Input() shelters: Shelter[];
  @Input() missionRoutes: MissionRoute[] = new Array();

  stats: IncidentStatus;

  center: number[] = [-77.886765, 34.210383];
  accessToken: string = window['_env'].accessToken;

  assignData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
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

  assignPaint: LinePaint = {
    'line-color': this.YELLOW,
    'line-width': 8
  };

  deliverPaint: LinePaint = {
    'line-color': this.BLUE,
    'line-width': 8
  };

  constructor() { }

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIcon(missionStatus: string): string {
    if (missionStatus === 'REPORTED') {
      return 'red';
    } else {
      return 'yellow';
    }
  }

  onPopupOpen(id: string) {
    this.assignData.features[0].geometry.coordinates = [];
    this.assignData = { ...this.assignData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };

    if (id) {
      const missionRoute = this.missionRoutes.find((route: MissionRoute) => route.id === id);
      if (missionRoute) {
        this.assignData.features[0].geometry.coordinates = missionRoute.assignRoute;
        this.deliverData.features[0].geometry.coordinates = missionRoute.deliverRoute;
        this.assignData = { ...this.assignData };
        this.deliverData = { ...this.deliverData };
        this.bounds = AppUtil.getBounds(this.assignData.features[0].geometry.coordinates.concat(this.deliverData.features[0].geometry.coordinates));
      }
    }
  }

  ngOnInit() {
  }
}
