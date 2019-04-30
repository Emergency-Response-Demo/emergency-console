import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { IconDefinition, faShieldAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { AlertModel } from '../models/alert-model';
import { AlertService } from '../services/alert.service';
import { interval } from 'rxjs/internal/observable/interval';
import { KeycloakService } from 'keycloak-angular';
import { timeout } from 'rxjs/operators';

@Component({
  styleUrls: ['./header.component.css'],
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  logoutIcon: IconDefinition = faLock;
  accountIcon: IconDefinition = faShieldAlt;
  sidebarVisible = true;
  username = '';
  alerts: AlertModel[] = new Array();
  accountUrl: string;
  isLoggedIn: boolean;

  constructor(private alertService: AlertService, private renderer: Renderer2, private keycloak: KeycloakService) {
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

    if (window.innerWidth > 640) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }

  @HostListener('window:resize', ['$event'])
  checkForMobile(event?) {
    if (window.innerWidth < 640) {
      this.toggleSidebar();
    }
  }

  ngOnInit(): void {
    // this.alertService.getAlerts().subscribe(res => {
    //   this.alerts = res.map((alert: AlertModel) => {
    //     alert.type = `text-${alert.type}`;
    //     return alert;
    //   });
    // });
    this.alertService.getAlerts().map((alert: AlertModel) => {
      this.alerts.push({
        type: `text-${alert.type}`,
        message: alert.message
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
