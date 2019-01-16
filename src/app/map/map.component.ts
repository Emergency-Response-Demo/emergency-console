import { Component, OnInit, Input } from '@angular/core';
import { tileLayer, latLng, marker, Icon, Marker, MapOptions } from 'leaflet';
import { MapService } from './map.service';
import { MapIcons } from './map-icons';
import { Subject } from 'rxjs/internal/Subject';
import { IncidentStatus } from '../incident/incident-status';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input()
  reload$: Subject<string>;
  options: MapOptions;
  layers: Marker[];

  load(): void {
    this.mapService.getData().subscribe(res => {
      const newMarkers: Marker[] = new Array();

      res.map(incident => {
        const newMarker = marker([incident.lat, incident.lon], {
          icon: this.getIcon(incident.missionStatus)
        }).bindPopup(this.getPopup(incident));

        newMarkers.push(newMarker);
      });

      this.layers = newMarkers;
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

  constructor(private mapService: MapService) {
    this.reload$ = new Subject();
    this.layers = [];
    this.options = {
      layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Red Hat' })],
      zoom: 12,
      center: latLng(34.210383, -77.886765)
    };
  }

  ngOnInit() {
    this.reload$.subscribe(res => {
      this.load();
    });

    this.load();
  }
}
