import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, marker, icon } from 'leaflet';
import { MapService } from './map.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  options = {
    layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Red Hat' })],
    zoom: 11,
    center: latLng(34.210383, -77.886765)
  };

  // pulled this from https://github.com/pointhi/leaflet-color-markers
  yellowIcon = icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  blueIcon = icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  greenIcon = icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  redIcon = icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  layers = [];

  onMapReady(map: L.Map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  load(): void {
    this.mapService.getData().subscribe(res => {
      this.layers.splice(0, this.layers.length);

      for (const incident of res) {
        const newMarker = marker([incident.lat, incident.lon], {
          icon: this.redIcon,
          title: `Contact: ${incident.reporter.fullName}, ${incident.reporter.phoneNumber} Number of people: ${incident.numberOfPeople}`
        });
        this.layers.push(newMarker);
      }

      // this.layers = [
      //   marker([34.16877, -77.87045], { icon: this.yellowIcon }),
      //   marker([34.18323, -77.84099], { icon: this.greenIcon }),
      //   marker([34.2367, -77.83479], { icon: this.redIcon }),
      //   marker([34.14338, -77.88274], { icon: this.blueIcon })
      // ];
    });
  }

  constructor(private mapService: MapService, private dashboardService: DashboardService) {
    this.dashboardService.reload$.subscribe(res => {
      console.log(`Map component ${res}`);
      this.load();
    });
  }

  ngOnInit() {
    this.load();
  }
}
