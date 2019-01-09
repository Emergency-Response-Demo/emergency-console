import {Component, OnInit} from '@angular/core';
import {KeycloakService} from '../keycloak.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  constructor(private keycloakService: KeycloakService) {
  }

  profile: KeycloakProfile;

  ngOnInit() {
    const auth = this.keycloakService.getAuth();

    if (auth.loggedIn) {
      this.profile = auth.profile;
    } else {
      this.profile = {};
    }
  }
}
