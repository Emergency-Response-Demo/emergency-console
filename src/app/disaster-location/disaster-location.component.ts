import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { default as MapboxGeocoder } from '@mapbox/mapbox-gl-geocoder'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Shelter } from '../models/shelter';
import { InclusionZone } from '../models/inclusion-zone';
import { DisasterService } from '../services/disaster.service';
import { default as MapboxDraw, default as DirectSelectMode, DrawPolygonMode } from '@mapbox/mapbox-gl-draw';
import * as mapboxgl from 'mapbox-gl';
import * as mapboxSdk from '@mapbox/mapbox-sdk';
import { default as geocodingService } from '@mapbox/mapbox-sdk/services/geocoding';
import { default as uuid } from 'uuid/v1';
import { DisasterCenter } from '../models/disaster-center';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-disaster-location',
  templateUrl: './disaster-location.component.html',
  styleUrls: ['./disaster-location.component.scss']
})
export class DisasterLocationComponent implements OnInit, OnDestroy {
  map: mapboxgl.Map;
  isLoading = false;
  loadingIcon: IconDefinition = faCircleNotch;
  center: DisasterCenter;
  boundsOptions: mapboxgl.FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  bounds: mapboxgl.LngLatBoundsLike;
  shelters: Map<string, Shelter> = new Map<string, Shelter>();
  mapDrawTools: MapboxDraw;
  shelterMode: boolean = false;
  inclusionZones: InclusionZone[];

  constructor(
    private keycloak: KeycloakService,
    private disasterService: DisasterService,
    private httpClient: HttpClient
  ) { 
  }

  public loadMap(map: mapboxgl.Map): void {
    this.map = map;

    var geocoder:MapboxGeocoder = new MapboxGeocoder({
      accessToken: this.accessToken,
      mapboxgl: mapboxgl,
      marker: false
    });

    //clear shelters and inclusion zones when zooming to new location
    geocoder.on("result", () => {
      this.clearShelters();
      this.clearInclusionZones();
    });
    geocoder.addTo(this.map);

    this.mapDrawTools = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });
    this.map.addControl(this.mapDrawTools);

    //add inclusion zones to the map
    this.inclusionZones.forEach(zone => {
      var feature = {
        id: zone.id,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [zone.points],
        },
        properties: {}
      }

      this.mapDrawTools.add(feature);
    });
  }

  async ngOnInit() {
    const isLoggedIn = await this.keycloak.isLoggedIn();

    //only load component for incident_commander
    if (!isLoggedIn || ! this.keycloak.isUserInRole('incident_commander')) {
      location.replace("/home/dashboard");
      return;
    }
    var shelterArray:Shelter[] = await this.disasterService.getShelters();
    shelterArray.forEach(shelter => this.shelters.set(shelter.id, shelter));
    this.inclusionZones = await this.disasterService.getInclusionZones();
    this.center = await this.disasterService.getDisasterCenter();
  }

  ngOnDestroy() {
  }


  public dragChangeCenter(event) {
    if (! event.target._easeOptions.center.lng) {
      return;
    }
    var lngLat = this.map.getCenter().toArray();
    this.center.lat = this.map.getCenter().lat;
    this.center.lon = this.map.getCenter().lng;
    var geocodingClient = geocodingService(mapboxSdk({accessToken:this.accessToken}));
    geocodingClient.reverseGeocode({
      query: lngLat,
      types: ["place"],
      limit: 1
    }).send()
      .then(response => {
        if (response.body.features.length > 0) {
          document.getElementById("centerCity").innerHTML = response.body.features[0].place_name;
          this.center.name = response.body.features[0].place_name;
        } else {
          console.log(`Problem retrieving city for coordinates: ${lngLat}`);
        }
      });
  }

  public placeShelter(event) {
    if (event.lngLat && event.type === "click" && this.shelterMode) {
      var shelterId = uuid();
      this.shelters.set(shelterId, new Shelter(shelterId, event.lngLat.lng, event.lngLat.lat));
      this.toggleShelterMode();
      setTimeout(()=>{
        document.getElementById(shelterId).click();
        (<HTMLElement>document.getElementsByClassName(shelterId)[0]).focus();
      }, 250);
    }
  }

  public showPopup(marker:mapboxgl.Marker, event) {
    if (! event.isTrusted) {
      marker.togglePopup();
    }
  }

  public moveShelter = (event) => {
    if (event.target) {
      event = event.target;
    }

    var shelterId = event._element.firstChild.id;

    this.shelters.get(shelterId).lon = event._lngLat.lng;
    this.shelters.get(shelterId).lat = event._lngLat.lat
  }

  public toggleShelterMode() {
    if (this.shelterMode) {
      document.getElementById("shelterButton").innerHTML = "Place Shelter";
      this.map.getCanvas().style.cursor = ''
    } else {
      document.getElementById("shelterButton").innerHTML = "Cancel";
      this.map.getCanvas().style.cursor = 'crosshair';
    }
    this.shelterMode = ! this.shelterMode;
  }

  public clearShelters() {
    this.shelters.clear();
  }

  public clearInclusionZones() {
    this.mapDrawTools.deleteAll();
    this.inclusionZones = [];
  }

  public save() {
    var unNamedShelters = Array.from(this.shelters.values()).filter(shelter => !shelter.name);
    if (unNamedShelters.length > 0) {
      var clause = unNamedShelters.length == 1 ? "is 1 shelter" : `are ${unNamedShelters.length} shelters`;
      alert(`There ${clause} with no name! Please click each shelter icon to enter one.`);
      return;
    }
    if (this.shelters.size == 0) {
      alert("There are no shelters! Without at least one, responders won't have anywhere to take incident victims.");
      return;
    }

    var drawnZones = this.mapDrawTools.getAll();

    if (drawnZones.features.length == 0) {
      alert("There are no disaster areas! Without at least one, incidents have no place to spawn.");
      return;
    }

    this.inclusionZones = [];
    drawnZones.features.forEach(feature => {
      this.inclusionZones.push(
        new InclusionZone(feature.id, feature.geometry.coordinates[0])
      );
    });

    this.center.zoom = this.map.getZoom();

    var json = {
      center: this.center,
      shelters: Array.from(this.shelters.values()),
      inclusionZones: this.inclusionZones
    }

    this.httpClient.post<any>("disaster-service/disaster", json).subscribe(data => {});
    location.reload();
  }

  @HostListener('keydown', ['$event']) updateShelterName(event) {
    if (event.key === 'Enter' && this.shelters.has(event.target.className)) {
      this.shelters.get(event.target.className).name = event.target.value;
    }
  }

  public presetLocation(event) {
    this.httpClient.get(<any>(`disaster-service/disaster/defaults/${event.target.value}`)).subscribe(data => {});
    location.reload();
  }
}
