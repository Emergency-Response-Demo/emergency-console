import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from './responder';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faShip, faPhone, faBriefcaseMedical } from '@fortawesome/free-solid-svg-icons';
import { MapMouseEvent, LngLatBoundsLike, LngLat, FitBoundsOptions } from 'mapbox-gl';
import { MissionService } from './mission.service';
import { LineString } from 'geojson';
import { AppUtil } from '../app-util';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent implements OnInit {
  model: Responder = new Responder();
  center: LngLat = new LngLat(-77.886765, 34.210383);
  userIcon: IconDefinition = faUser;
  boatIcon: IconDefinition = faShip;
  phoneIcon: IconDefinition = faPhone;
  medicalIcon: IconDefinition = faBriefcaseMedical;
  boundsOptions: FitBoundsOptions = {
    padding: 50
  };
  accessToken: string = window['_env'].accessToken;
  directions: LineString;
  start: LngLat;
  end: LngLat;
  bounds: LngLatBoundsLike;

  constructor(private messageService: MessageService, private keycloak: KeycloakService, private missionService: MissionService) {}

  submit(): void {
    this.messageService.info('You are now available to receive a rescue mission');
    this.end = new LngLat(-77.94346099447226, 34.21828123440535);
    this.directions = null;

    this.missionService.getDirections(this.start, this.end).subscribe(res => {
      this.directions = res.routes[0].geometry;
      this.bounds = AppUtil.getBounds(this.directions.coordinates);
    });
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat) {
      this.start = event.lngLat;
    }
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          this.model.fullName = `${profile.firstName} ${profile.lastName}`;
          this.model.phoneNumber = profile['attributes'].phoneNumber;
          this.model.boatCapacity = profile['attributes'].boatCapacity;
          this.model.medical = profile['attributes'].medical;
        });
      }
    });
  }
}
