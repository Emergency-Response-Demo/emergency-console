import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { IconDefinition, faShieldAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { AlertModel } from '../alerts/alert-model';
import { AlertService } from '../alerts/alert.service';
import { interval } from 'rxjs/internal/observable/interval';
import { KeycloakService } from 'keycloak-angular';

@Component({
  styleUrls: ['./header.component.css'],
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  logoutIcon: IconDefinition;
  accountIcon: IconDefinition;
  formIcon: IconDefinition;
  sidebarVisible: boolean;
  username: string;
  alerts: AlertModel[];
  accountUrl: string;
  isLoggedIn: boolean;

  constructor(private alertService: AlertService, private renderer: Renderer2, private keycloak: KeycloakService) {
    this.logoutIcon = faLock;
    this.accountIcon = faShieldAlt;
    this.sidebarVisible = true;
    this.alerts = new Array();
    this.username = '';

    // hide sidebar by default on mobile
    this.checkForMobile();
  }

  doLogout(): void {
    if (this.isLoggedIn) {
      this.keycloak.logout();
    }
  }

  doAccount(): void {
    if (this.isLoggedIn) {
      window.open(this.accountUrl, '_blank');
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible === false) {
      this.renderer.removeClass(document.body, 'sidebar-show');
    } else {
      this.renderer.addClass(document.body, 'sidebar-show');
    }

    // only manually trigger events on a non-mobile interface
    if (window.innerWidth > 640) {
      interval(500).subscribe(() => {
        // triggering this event so that the mapbox api will auto resize the map on sidebar hide
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  checkForMobile(event?) {
    if (window.innerWidth < 640) {
      this.toggleSidebar();
    }
  }

  ngOnInit(): void {
    this.alertService.getAlerts().subscribe(res => {
      this.alerts = res.map((alert: AlertModel) => {
        alert.type = `text-${alert.type}`;
        return alert;
      });
    });

    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.isLoggedIn = true;
        this.username = this.keycloak.getUsername();

        const instance = this.keycloak.getKeycloakInstance();
        this.accountUrl = `${instance.authServerUrl}/realms/${instance.realm}/account`;
      }
    });
  }
}
