import { Component, OnInit, Input } from '@angular/core';
import { MapService } from './map.service';
import { Subject } from 'rxjs/internal/Subject';
import { MapItem } from './map-item';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input()
  reload$: Subject<string> = new Subject();

  mapItems: MapItem[] = new Array();
  center: number[] = [-77.886765, 34.210383];
  accessToken: string = window['_env'].accessToken;

  constructor(private mapService: MapService) {}

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  load(): void {
    this.mapService
      .getIds()
      .toPromise()
      .then((ids: string[]) => {
        this.mapService.getMissions(ids).subscribe((item: MapItem) => this.mapItems.push(item));
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
    this.reload$.subscribe(() => {
      this.load();
    });

    this.load();
  }
}
