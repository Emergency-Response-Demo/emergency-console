import { Component, OnInit, NgZone } from '@angular/core';
import { tileLayer, latLng, marker, icon, Icon } from 'leaflet';
import { MapService } from './map.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { MessageService } from '../message/message.service';
import { MapIcons } from './map-icons';
import { IncidentStatus } from '../incident/incident-status';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  options = {
    layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Red Hat' })],
    zoom: 12,
    center: latLng(34.210383, -77.886765)
  };

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
          icon: this.getIcon(incident.missionStatus)
        }).bindPopup(this.getPopup(incident));

        this.layers.push(newMarker);
      }
    });
  }

  getPopup(incident: any): string {
    return `Number of people: ${incident.numberOfPeople}<br>
    Medical Needed: ${incident.medicalNeeded}<br>
    Status: ${incident.missionStatus}<br>
    Reporter: ${incident.reporter.fullName}<br>
    Phone Number: ${incident.reporter.phoneNumber}<br>
    Reported: ${incident.reporter.reportTime}`;
  }

  getIcon(missionStatus: string): Icon {
    switch (missionStatus) {
      case 'Requested': {
        return MapIcons.red;
      }
      case 'Assigned': {
        return MapIcons.yellow;
      }
      case 'PickedUp': {
        return MapIcons.blue;
      }
      case 'Rescued': {
        return MapIcons.green;
      }
      case 'Cancelled': {
        return MapIcons.grey;
      }
      default: {
        return MapIcons.blue;
      }
    }
  }

  constructor(private mapService: MapService, private dashboardService: DashboardService, private messageSerivce: MessageService) {
    this.dashboardService.reload$.subscribe(res => {
      this.load();
    });
  }

  ngOnInit() {
    this.load();
  }
}
