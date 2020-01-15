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
import { v4 as uuid } from 'uuid';

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
  enableDrawingPriorityZones = false;  // TODO make a button to toggle this?
  priZoneButtonText = 'Create Priority Zone';

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
   'background-image': 'url(assets/img/circle-shelter-hospital-colored.svg)'
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

  // RED if REPORTED, YELLOW otherwise (I guess assigned is the only other state right now)
  getIncidentIcon(incident: Incident): string {
    return !incident.status || incident.status === 'REPORTED' ? 'marker-incident-helpme-colored.svg' : 'marker-incident-helpassigned-colored.svg';
  }

  getResponderIcon(person: boolean): string {
    return (person ? 'circle-responder-boat-with-person-colored.svg' : 'circle-responder-boat-colored.svg');
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

  getLLFromFeatureData(data): LngLat {
    if (data.type !== 'Feature') { return null; } // error, not a feature
    return new LngLat(+data.properties.center[0], +data.properties.center[1]);
  }

  projectFeatureDataToPoint(data): Point {
    return this.map.project(this.getLLFromFeatureData(data));
  }

  public onDrawPriorityZoneButtonClick(): void {
    this.enableDrawingPriorityZones = !this.enableDrawingPriorityZones; // toggle mode
    if (this.enableDrawingPriorityZones === true) { // toggled on
      this.priZoneButtonText = 'Done Drawing';
      this.mapDrawTools.changeMode('drag_circle', { initialRadiusInKm: 2 });
    } else { // toggled off
      this.priZoneButtonText = 'Create Priority Zone';
      this.mapDrawTools.changeMode('simple_select', { initialRadiusInKm: 2 });

      const data = this.mapDrawTools.getAll();
      if (data.features) {
        data.features.forEach((feature) => {
          // alert(JSON.stringify(feature));
          // e.g. feature.properties {"isCircle":true,"center":[-78.05985704920441,34.139520841135806],"radiusInKm":4.440545224272349}
          if (feature.properties.isCircle === true) {
            this.addedOrUpdatedPriorityZone(feature.id, feature.properties.center[0], feature.properties.center[1], feature.properties.radiusInKm);
          }
        });
      }
    }
  }

  public onPriorityZoneDeleteButtonClick(): void {
    this.mapDrawTools.deleteAll();  // this deletes the drawn ones

    const json = {
      id: uuid(),
      messageType: 'PriorityZoneClearEvent',
      body: {}
    };
    this.httpClient.post<any>('/priority-zone/clear', json).subscribe(data => {});
  }

  // Fired when a feature is created. The following interactions will trigger this event:
  // Finish drawing a feature.
  // Simply clicking will create a Point.
  // A LineString or Polygon is only created when the user has finished drawing it
  // i.e. double-clicked the last vertex or hit Enter — and the drawn feature is valid.
  //
  // The event data is an object - features: Array<Object>
  public createdDrawArea(event) {
    // TODO?
  }

  // Fired when one or more features are updated. The following interactions will trigger
  // this event, which can be subcategorized by action:
  // action: 'move'
  //   * Finish moving one or more selected features in simple_select mode.
  //     The event will only fire when the movement is finished (i.e. when the user
  //     releases the mouse button or hits Enter).
  // action: 'change_coordinates'
  //   * Finish moving one or more vertices of a selected feature in direct_select mode.
  //     The event will only fire when the movement is finished (i.e. when the user releases
  //     the mouse button or hits Enter, or her mouse leaves the map container).
  //   * Delete one or more vertices of a selected feature in direct_select mode, which can
  //     be done by hitting the Backspace or Delete keys, clicking the Trash button, or invoking draw.trash().
  //   * Add a vertex to the selected feature by clicking a midpoint on that feature in direct_select mode.
  //
  // This event will not fire when a feature is created or deleted. To track those interactions, listen for draw.create and draw.delete events.
  //
  // The event data is an object - features: Array<Feature>, action: string
  public updatedDrawArea(event) {
    // TODO?
  }

  public loadMap(map: Map): void {
    this.map = map;
    // MapBoxDraw gives us drawing and editing features in mapbox
    this.mapDrawTools = new MapboxDraw({
      defaultMode: 'simple_select',
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

    // Can't override these or the events don't fire to MapboxDraw custom modes - TODO figure out how to get events for drag/updates
    // https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
    // this.map.on('draw.create', this.createdDrawArea);
    // this.map.on('draw.update', this.updatedDrawArea);

    this.map.addControl(new NavigationControl(), 'top-right');

    // var feature = {"id":"f024c249dccee2ed8c10b596e7917ee0","type":"Feature","properties":{"isCircle":true,"center":[-78.04676819361207,34.190086783124514],"radiusInKm":5.9317764928329},"geometry":{}};//{"coordinates":[[[-78.05309341804741,34.243175420794124],[-78.05935761222806,34.24240679209363],[-78.06550033808311,34.241133987136614],[-78.07146233603478,34.239369286249186],[-78.07718609962207,34.23712971476574],[-78.08261643275308,34.23443687789704],[-78.08770098408702,34.23131675123683],[-78.0923907532908,34.22779942897985],[-78.09664056421482,34.22391883233852],[-78.10040950038247,34.21971238103471],[-78.10366129858363,34.21522063110081],[-78.10636469680064,34.210486882548615],[-78.10849373316702,34.20555676075213],[-78.11002799316238,34.200477775637765],[-78.11095280277291,34.19529886298131],[-78.1112593658905,34.19006991227361],[-78.11094484477877,34.184841285734194],[-78.11001238299461,34.17966333312508],[-78.10847107071426,34.17458590704312],[-78.10633585296645,34.16965788335156],[-78.10362738181844,34.16492669134803],[-78.10037181408677,34.160437858159995],[-78.09660055665044,34.156234571710534],[-78.09234996192525,34.152357266408565],[-78.08766097650962,34.14884323549169],[-78.08257874643333,34.145726273687934],[-78.07715218282547,34.14303635356825],[-78.07143349216659,34.14079933863717],[-78.06547767559894,34.13903673585839],[-78.05934200203625,34.137765489936925],[-78.05308546004026,34.13699782128588],[-78.04676819361207,34.13674110919385],[-78.04045092718387,34.13699782128588],[-78.03419438518787,34.137765489936925],[-78.02805871162519,34.13903673585839],[-78.02210289505754,34.14079933863717],[-78.01638420439866,34.14303635356825],[-78.0109576407908,34.145726273687934],[-78.00587541071451,34.14884323549169],[-78.00118642529888,34.152357266408565],[-77.99693583057369,34.156234571710534],[-77.99316457313736,34.160437858159995],[-77.98990900540569,34.16492669134803],[-77.98720053425768,34.16965788335156],[-77.98506531650987,34.17458590704312],[-77.98352400422952,34.17966333312508],[-77.98259154244536,34.184841285734194],[-77.98227702133363,34.19006991227361],[-77.98258358445122,34.19529886298131],[-77.98350839406176,34.200477775637765],[-77.98504265405711,34.20555676075213],[-77.9871716904235,34.210486882548615],[-77.9898750886405,34.21522063110081],[-77.99312688684167,34.21971238103471],[-77.99689582300931,34.22391883233852],[-78.00114563393333,34.22779942897985],[-78.00583540313711,34.23131675123683],[-78.01091995447106,34.23443687789704],[-78.01635028760207,34.23712971476574],[-78.02207405118935,34.239369286249186],[-78.02803604914102,34.241133987136614],[-78.03417877499608,34.24240679209363],[-78.04044296917672,34.243175420794124],[-78.05309341804741,34.243175420794124]]],"type":"Polygon"}};
    // this.mapDrawTools.add(feature);
  }

  public addedOrUpdatedPriorityZone(id, lon, lat, radiusInKm) {
    const json = {
      id: uuid(),
      messageType: 'PriorityZoneApplicationEvent',
      body: {
        lon: lon.toString(),
        lat: lat.toString(),
        id: id,
        radius: radiusInKm.toString()
      }
    };
    this.httpClient.post<any>('/priority-zone/apply', json).subscribe(data => {});
  }
}
