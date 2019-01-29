import { Component, OnInit, Input } from '@angular/core';
import { MapService } from './map.service';
import { Subject } from 'rxjs/internal/Subject';
import { MapItem } from './map-item';
import { MapMouseEvent } from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input()
  reload$: Subject<string>;

  mapItems: MapItem[];
  center: number[];

  constructor(private mapService: MapService) {
    this.reload$ = new Subject();
    this.center = [-77.886765, 34.210383];
  }

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  load(): void {
    this.mapService.getData().subscribe(res => {
      this.mapItems = res;
    });
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIcon(missionStatus: string): string {
    switch (missionStatus) {
      case 'Requested': {
        return 'red';
      }
      case 'Assigned': {
        return 'yellow';
      }
      case 'PickedUp': {
        return 'blue';
      }
      case 'Rescued': {
        return 'green';
      }
      case 'Cancelled': {
        return 'grey';
      }
      default: {
        return 'blue';
      }
    }
  }

  ngOnInit() {
    this.reload$.subscribe(res => {
      this.load();
    });

    this.load();
  }
}
