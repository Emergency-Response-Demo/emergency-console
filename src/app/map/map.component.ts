import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Incident } from '../models/incident';
import { Responder } from '../models/responder';
import { Shelter } from '../models/shelter';
import { AppUtil } from '../app-util';
import { ResponderService } from '../services/responder.service';
import { IncidentService } from '../services/incident.service';
import { Mission } from '../models/mission';
import { LineLayout, LinePaint, LngLatBoundsLike, FitBoundsOptions, LngLat, Point,
          MapMouseEvent, Map, Marker, NavigationControl } from 'mapbox-gl';
import { default as MapboxDraw } from '@mapbox/mapbox-gl-draw';
import { CircleMode, DragCircleMode, DirectMode, SimpleSelectMode } from 'mapbox-gl-draw-circle';
import { default as DrawStyles } from './util/draw-styles.js';
import { PriorityZone } from '../models/priority-zone';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  @Input() responders: Responder[];
  @Input() incidents: Incident[];
  @Input() shelters: Shelter[];
  @Input() missions: Mission[];
  @Input() priorityZones: PriorityZone[];

  map: Map;
  mapDrawTools: MapboxDraw;

  center: number[] = AppUtil.isMobile() ? [-77.886765, 34.139921] : [-77.886765, 34.158808];
  accessToken: string = window['_env'].accessToken;

  pickupData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  deliverData: GeoJSON.FeatureCollection<GeoJSON.LineString> = AppUtil.initGeoJson();
  zoom: number[] = [AppUtil.isMobile() ? 10 : 10.5];
  enableDrawingPriorityZones = true;  // TODO make a button to toggle this?

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

  constructor(public responderService: ResponderService, public incidentService: IncidentService, private httpClient: HttpClient) { }

  get currentIncidents(): Incident[] {
    return this.incidents.filter(i => i.status !== 'RESCUED');
  }

  get activeResponders(): Responder[] {
    return this.responders;
  }

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIncidentIcon(incident: Incident): string {
    return !incident.status || incident.status === 'REPORTED' ? 'marker-red.svg' : 'marker-yellow.svg';
  }

  getResponderIcon(person: boolean): string {
    return (person ? 'responder-person.svg' : 'responder.svg');
  }

  getResponderMission(responder: Responder) {
    return this.missions.find(m => m.responderId === responder.id && m.status !== 'COMPLETED');
  }

  getIncidentMission(incident: Incident) {
    return this.missions.find(m => m.incidentId === incident.id);
  }

  onResponderPopup(responder: Responder): void {
    const mission = this.getResponderMission(responder);
    if (!mission) {
      return;
    }
    this.onPopup(mission);
  }

  onIncidentPopup(incident: Incident): void {
    const mission = this.getIncidentMission(incident);
    if (!mission) {
      return;
    }
    this.onPopup(mission);
  }

  public onPopup(mission: Mission): void {
    if (!mission || mission.status === 'COMPLETED') {
      return;
    }

    this.pickupData.features[0].geometry.coordinates = [];
    this.pickupData = { ...this.pickupData };
    this.deliverData.features[0].geometry.coordinates = [];
    this.deliverData = { ...this.deliverData };
    const missionRoute = AppUtil.getRoute(mission.id, mission.steps);
    if (!missionRoute) {
      return;
    }

    this.pickupData.features[0].geometry.coordinates = missionRoute.pickupRoute;
    this.deliverData.features[0].geometry.coordinates = missionRoute.deliverRoute;
    this.pickupData = { ...this.pickupData };
    this.deliverData = { ...this.deliverData };
    this.bounds = AppUtil.getBounds(missionRoute.pickupRoute.concat(missionRoute.deliverRoute));
  }

  ngOnInit() {
  }

  getLL(data): LngLat {
    return new LngLat(+data.lng, +data.lat);
  }

  projectLL(ll: LngLat): Point {
    return this.map.project(this.getLL(ll));
  }

  public onDrawPriorityZoneButtonClick(): void {
    this.enableDrawingPriorityZones = !this.enableDrawingPriorityZones; // toggle mode
    if (this.enableDrawingPriorityZones === true) {
      // this.map.dragPan.disable();
      // this.map.scrollZoom.disable();
    } else {
      // this.map.dragPan.enable();
      // this.map.scrollZoom.enable();
      this.mapDrawTools.changeMode('drag_circle', { initialRadiusInKm: 2 });
    }
  }

  public onPriorityZoneDeleteButtonClick(): void {
    this.mapDrawTools.deleteAll();
  }

  public createdDrawArea() {
    var data = this.mapDrawTools.getAll();
    // alert('created a priority area' + data);
  }

  public updatedDrawArea() {
    var data = this.mapDrawTools.getAll();
    // alert('updated a priority area' + data);
  }

  public onMapMouseDown(click: MapMouseEvent): void {}
  public onMapMouseUp(click: MapMouseEvent): void {}
  public onMapMouseMove(click: MapMouseEvent): void {}
  public onMapClick(click: MapMouseEvent): void {}

  public loadMap(map: Map): void {
    this.map = map;
    // MapBoxDraw gives us drawing and editing features in mapbox
    this.mapDrawTools = new MapboxDraw({
      defaultMode: 'drag_circle',
      displayControlsDefault: false,
      userProperties: true,
      styles: DrawStyles,
      modes: {
        ...MapboxDraw.modes,
        draw_circle  : CircleMode,
        drag_circle  : DragCircleMode,
        direct_select: DirectMode,
        simple_select: SimpleSelectMode
      }
    });
    this.map.addControl(this.mapDrawTools);

    // Can't override these or the events don't fire to MapboxDraw custom modes - TODO figure out how to get events
    // this.map.on('draw.create', this.createdDrawArea);
    // this.map.on('draw.update', this.updatedDrawArea);

    this.map.addControl(new NavigationControl(), 'top-right');
  }

  public addPriorityZone(click: MapMouseEvent):void {
    if (click.lngLat) {
      new Marker({draggable: true})
        .setLngLat([click.lngLat.lng, click.lngLat.lat])
        .addTo(this.map);

        var json = {centerLongitude:click.lngLat.lng, centerLatitude:click.lngLat.lat};

        this.httpClient.post<any>("/priority-zone/create", json).subscribe(data => {

        });
    }
  }
}
