import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from './responder';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faShip, faPhone, faBriefcaseMedical } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent implements OnInit {
  model: Responder;
  center: number[];
  userIcon: IconDefinition;
  boatIcon: IconDefinition;
  phoneIcon: IconDefinition;
  medicalIcon: IconDefinition;

  constructor(private messageService: MessageService, private keycloak: KeycloakService) {
    this.model = new Responder();
    this.center = [-77.886765, 34.210383];
    this.userIcon = faUser;
    this.boatIcon = faShip;
    this.phoneIcon = faPhone;
    this.medicalIcon = faBriefcaseMedical;
  }

  submit(): void {
    this.messageService.info('You are now available to receive a rescue mission');
    console.log(this.model);
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
