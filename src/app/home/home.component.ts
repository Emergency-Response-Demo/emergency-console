import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ResponderService } from '../services/responder.service';
import { Responder } from '../models/responder';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
  static DEFAULT_PHONE_NUMBER = '001001001';
  static DEFAULT_BOAT_CAPACITY = 12;
  static DEFAULT_MEDICAL_KIT = true;

  fullName = '';

  constructor(
    public route: ActivatedRoute,
    private keycloak: KeycloakService,
    private responderService: ResponderService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          this.fullName = `${profile.firstName} ${profile.lastName}`;
          this.responderService.getByName(this.fullName).then((responder: Responder) => {
            if (responder.id === 0) {
              responder.name = this.fullName;
              responder.name = `${profile.firstName} ${profile.lastName}`;
              responder.phoneNumber = HomeComponent.DEFAULT_PHONE_NUMBER;
              responder.boatCapacity = HomeComponent.DEFAULT_BOAT_CAPACITY;
              responder.medicalKit = HomeComponent.DEFAULT_MEDICAL_KIT;
              if (profile && profile['attributes']) {
                const attrs = profile['attributes'];
                if (attrs.phoneNumber && attrs.phoneNumber[0]) {
                  responder.phoneNumber = attrs.phoneNumber[0];
                }
                if (attrs.boatCapacity && attrs.boatCapacity[0]) {
                  // clamp between 0 and 12
                  const boatCapacity = attrs.boatCapacity[0] <= 0 ? 0 : attrs.boatCapacity[0] >= 12 ? 12 : attrs.boatCapacity[0];
                  responder.boatCapacity = boatCapacity;
                }
                if (attrs.medical && attrs.medical[0]) {
                  responder.medicalKit = attrs.medical[0];
                }
              }
              responder.enrolled = false;
              responder.person = true;
              responder.available = true;

              this.messageService.info('Registering as new responder');

              this.responderService.add(responder).then(() => this.messageService.success(`Succesfully registered ${this.fullName}`));
            }
          });
        });
      }
    });
  }

}
