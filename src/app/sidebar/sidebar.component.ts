import { Component, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  githubIcon: IconDefinition;
  incidentCommander: boolean;

  constructor(private keycloak: KeycloakService) {
    this.githubIcon = faGithub;
  }

  ngOnInit() {
    const isLoggedIn = this.keycloak.isLoggedIn();
    this.incidentCommander = isLoggedIn && this.keycloak.isUserInRole('incident_commander');
  }
}
