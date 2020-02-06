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
import { DisasterCenter } from '../models/disasterCenter';
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
  shelters: Shelter[];
  mapDrawTools: MapboxDraw;
  shelterMode: boolean = false;
  unNamedShelters: Map<string, Shelter> = new Map<string, Shelter>();
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
    this.shelters = await this.disasterService.getShelters();
    this.inclusionZones = await this.disasterService.getInclusionZones();
    this.center = await this.disasterService.getDisasterCenter();
    console.log(this.center);
    const isLoggedIn = await this.keycloak.isLoggedIn();
    if (!isLoggedIn) {
      return;
    }
    const profile = await this.keycloak.loadUserProfile();
  }

  ngOnDestroy() {
  }


  public dragChangeCenter(event) {
    if (! event.target._easeOptions.center.lng) {
      return;
    }
    var lngLat = [event.target._easeOptions.center.lng, event.target._easeOptions.center.lat];
    this.center.lon = lngLat[0];
    this.center.lat = lngLat[1];
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
    if (event.lngLat && this.shelterMode) {
      var el = document.createElement("div");
      el.className = "shelter";
      var shelterId = uuid();

      const popup = new mapboxgl.Popup({offset: [0, -12]}).setHTML(
        `<div class="card-text">
            <p>
                <strong>Shelter Name: </strong><span><input type="text" id='${shelterId}' autofocus/></span><br />
                <strong>Rescued: </strong>0<br />
                <strong>Long/Lat: </strong> ${event.lngLat.lng},${event.lngLat.lat}<br />
            </p>
        </div>`
      )

      const marker = new mapboxgl.Marker(el)
        .setLngLat(event.lngLat)
        .setPopup(popup)
        .addTo(this.map);

      this.unNamedShelters.set(shelterId, new Shelter(shelterId, event.lngLat.lng, event.lngLat.lat));
    }
  }

  public toggleShelterMode() {
    if (this.shelterMode) {
      document.getElementById("shelterButton").innerHTML = "Place Shelter";
      this.map.getCanvas().style.cursor = ''
    } else {
      document.getElementById("shelterButton").innerHTML = "Done";
      this.map.getCanvas().style.cursor = 'crosshair';
    }
    this.shelterMode = ! this.shelterMode;
  }

  public clearShelters() {
    var shelters = document.getElementsByClassName("mapboxgl-marker");
    Array.from(shelters).forEach((el) => {
      el.parentNode.removeChild(el);
    });
    this.shelters = [];
    this.unNamedShelters.clear();
  }

  public clearInclusionZones() {
    this.mapDrawTools.deleteAll();
    this.inclusionZones = [];
  }

  public save() {
    if (this.unNamedShelters.size > 0) {
      var clause = this.unNamedShelters.size == 1 ? "is 1 shelter" : `are ${this.unNamedShelters.size} shelters`;
      alert(`There ${clause} with no name! Please click each shelter icon to enter one.`);
      return;
    }
    if (this.shelters.length == 0) {
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

    var json = {
      center: this.center,
      shelters: this.shelters,
      inclusionZones: this.inclusionZones
    }

    this.httpClient.post<any>("disaster-service/disaster", json).subscribe(data => {});
    location.reload();
  }

  @HostListener('keydown', ['$event']) updateShelterName(event) {
    if (event.key === 'Enter' && this.unNamedShelters.has(event.target.id)) {
      var shelter:Shelter = this.unNamedShelters.get(event.target.id);
      shelter.name = event.target.value;
      event.target.parentNode.innerHTML = event.target.value;
      this.unNamedShelters.delete(event.target.id);
      this.shelters.push(shelter);
    }
 }
}
