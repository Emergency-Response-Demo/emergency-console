import { Component, OnInit, Input } from '@angular/core';
import { MapService } from './map.service';
import { Subject } from 'rxjs/internal/Subject';
import { Incident } from '../incident';
import { Responder } from '../responder';
import { Shelter } from '../shelter';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input()
  reload$: Subject<string> = new Subject();

  responders: Responder[] = new Array();
  incidents: Incident[] = new Array();
  shelters: Shelter[] = new Array();
  center: number[] = [-77.886765, 34.210383];
  accessToken: string = window['_env'].accessToken;

  constructor(private mapService: MapService) {}

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  load(): void {
    this.mapService.getMissions().subscribe(res => {
      res.forEach(mission => {
        const status = mission.status;

        if (status === 'CREATED') {
          this.incidents.push({
            missionId: mission.id,
            id: mission.incidentId,
            lat: mission.incidentLat,
            lon: mission.incidentLong,
            status: mission.status
          });
        }
        if (status === 'PICKEDUP' || status === 'CREATED') {
          let lat = mission.responderStartLat;
          let lon = mission.responderStartLong;
          if (mission.responderLocationHistory.length > 1) {
            lat = mission.responderLocationHistory.pop().location.lat;
            lon = mission.responderLocationHistory.pop().location.long;
          }
          this.responders.push({
            missionId: mission.id,
            id: mission.responderId,
            lat: lat,
            lon: lon
          });
        }
        if (status === 'DROPPED' || status === 'PICKEDUP') {
          const found = this.shelters.filter(shelter => {
            return shelter.lat === mission.destinationLat && shelter.lon === mission.destinationLong;
          });
          if (!found) {
            this.shelters.push({
              lat: mission.destinationLat,
              lon: mission.destinationLong
            });
          }
        }
      });
    });
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIcon(missionStatus: string): string {
    switch (missionStatus) {
      case 'REPORTED': {
        return 'red';
      }
      case 'CREATED': {
        return 'yellow';
      }
      case 'PICKEDUP': {
        return 'blue';
      }
      case 'DROPPED': {
        return 'green';
      }
      case 'CANCELLED': {
        return 'grey';
      }
      default: {
        return 'blue';
      }
    }
  }

  ngOnInit() {
    this.reload$.subscribe(() => this.load());

    this.load();
  }
}
