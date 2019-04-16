import { Component, OnInit, Input } from '@angular/core';
import { MapService } from './map.service';
import { Subject } from 'rxjs/internal/Subject';
import { Incident } from '../incident';
import { Responder } from '../responder';
import { Shelter } from '../shelter';
import { MessageService } from '../message/message.service';
import { Mission } from '../mission';
import { IncidentService } from '../incident/incident.service';
import { IncidentStatus } from '../incident/incident-status';
import { ResponderService } from './responder.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input()
  reload$: Subject<string> = new Subject();

  @Input()
  stats$: Subject<IncidentStatus> = new Subject();

  @Input()
  util$: Subject<any> = new Subject();

  stats: IncidentStatus;
  responders: Responder[] = new Array();
  incidents: Incident[] = new Array();
  shelters: Shelter[] = [
    {
      name: 'Port City Marina',
      lat: 34.2461,
      lon: -77.9519,
      rescued: 0
    },
    {
      name: 'Wilmington Marine Center',
      lat: 34.1706,
      lon: -77.949,
      rescued: 0
    },
    {
      name: 'Carolina Beach Yacht Club',
      lat: 34.0583,
      lon: -77.8885,
      rescued: 0
    }
  ];
  center: number[] = [-77.886765, 34.210383];
  accessToken: string = window['_env'].accessToken;

  constructor(
    private mapService: MapService,
    private messageService: MessageService,
    private incidentService: IncidentService,
    private responderService: ResponderService
  ) {}

  markerClick(lngLat: number[]): void {
    this.center = lngLat;
  }

  load(): void {
    this.stats = {
      requested: 0,
      assigned: 0,
      pickedUp: 0,
      rescued: 0,
      cancelled: 0
    };
    this.mapService.getMissions().subscribe((missions: Mission[]) => {
      this.handleMissions(missions);

      this.incidentService.getReported().subscribe((incidents: Incident[]) => {
        this.handleIncidents(incidents);
      });

      this.responderService.getAvailable().subscribe((allAvailable: Responder[]) => {
        this.handleResponders(allAvailable);
      });
    });
  }

  private handleResponders(allAvailable: Responder[]): void {
    const total = allAvailable.length;
    const active = this.stats.assigned + this.stats.pickedUp;

    this.util$.next({
      active: active,
      total: total
    });

    this.responders.forEach((responder: Responder) => {
      const found = allAvailable.find((available: Responder) => {
        return responder.id === available.id;
      });
      if (found) {
        responder.name = found.name;
        responder.phoneNumber = found.phoneNumber;
        responder.medicalKit = found.medicalKit;
        responder.boatCapacity = found.boatCapacity;
      }
    });
  }

  private handleIncidents(incidents: Incident[]): void {
    incidents.forEach(incident => {
      this.incidents.push(incident);
      this.stats.requested++;
    });
    this.stats$.next(this.stats);
  }

  private handleMissions(missions: Mission[]): void {
    missions.forEach((mission: Mission) => {
      const status = mission.status;

      switch (status) {
        case 'CREATED': {
          this.stats.assigned++;
          this.handleCreated(mission);
          break;
        }
        case 'UPDATED': {
          this.stats.pickedUp++;
          this.handleUpdated(mission);
          break;
        }
        case 'COMPLETED': {
          this.stats.rescued++;
          this.handleCompleted(mission);
          break;
        }
        default: {
          this.messageService.warning(`status: '${status}' is not a known code`);
          break;
        }
      }
    });
  }

  private handleCreated(mission: Mission): void {
    this.incidents.push({
      missionId: mission.id,
      id: mission.incidentId,
      lat: mission.incidentLat,
      lon: mission.incidentLong,
      status: mission.status
    });
    this.responders.push({
      missionId: mission.id,
      id: mission.responderId,
      lat: mission.responderStartLat,
      lon: mission.responderStartLong,
      status: mission.status
    });
  }

  private handleUpdated(mission: Mission): void {
    this.responders.push({
      missionId: mission.id,
      id: mission.responderId,
      lat: mission.responderLocationHistory.pop().location.lat,
      lon: mission.responderLocationHistory.pop().location.long,
      status: mission.status
    });
  }

  private handleCompleted(mission: Mission): void {
    this.shelters = this.shelters.map(shelter => {
      if (shelter.lon === mission.destinationLong && shelter.lat === mission.destinationLat) {
        shelter.rescued++;
      }
      return shelter;
    });
  }

  // icons colored with coreui hex codes from https://iconscout.com/icon/location-62
  getIcon(missionStatus: string): string {
    if (missionStatus === 'REPORTED') {
      return 'red';
    } else {
      return 'yellow';
    }
  }

  ngOnInit() {
    this.reload$.subscribe(() => this.load());

    this.load();
  }
}
