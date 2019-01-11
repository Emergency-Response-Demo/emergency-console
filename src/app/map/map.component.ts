import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, marker, icon, Icon } from 'leaflet';
import { MapService } from './map.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { MessageService } from '../message/message.service';

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

  greyIcon = icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
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
          icon: this.getIconColor(incident.missionStatus),
          title: `Contact: ${incident.reporter.fullName}, ${incident.reporter.phoneNumber}, Number of people: ${incident.numberOfPeople}`
        }).on('click', this.onClick.bind(this));
        this.layers.push(newMarker);
      }
    });
  }

  // very hacky, probably should be a map lookup
  getIconColor(missionStatus: string): Icon {
    let coloredIcon = this.blueIcon;

    if (missionStatus === 'Requested') {
      coloredIcon = this.redIcon;
    } else if (missionStatus === 'Assigned') {
      coloredIcon = this.yellowIcon;
    } else if (missionStatus === 'PickedUp') {
      coloredIcon = this.blueIcon;
    } else if (missionStatus === 'Rescued') {
      coloredIcon = this.greenIcon;
    } else if (missionStatus === 'Cancelled') {
      coloredIcon = this.greyIcon;
    }

    return coloredIcon;
  }

  onClick(obj) {
    this.messageSerivce.info(obj.target.options.title);
  }
  constructor(private mapService: MapService, private dashboardService: DashboardService, private messageSerivce: MessageService) {
    this.dashboardService.reload$.subscribe(res => {
      console.log(`Map component ${res}`);
      this.load();
    });
  }

  ngOnInit() {
    this.load();
  }
}
