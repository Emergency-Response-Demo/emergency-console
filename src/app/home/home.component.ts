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
          this.responderService.getByName(this.fullName).subscribe((responder: Responder) => {
            if (responder.id === 0) {
              responder.name = this.fullName;
              responder.name = `${profile.firstName} ${profile.lastName}`;
              responder.phoneNumber = profile['attributes'].phoneNumber[0];
              responder.boatCapacity = profile['attributes'].boatCapacity[0];
              responder.medicalKit = profile['attributes'].medical[0];
              responder.enrolled = false;
              responder.person = true;
              responder.available = false;

              this.messageService.info('Registering as new responder');

              this.responderService.add(responder).subscribe(() => this.messageService.success(`Succesfully registered ${this.fullName}`));
            }
          });
        });
      }
    });
  }

}
