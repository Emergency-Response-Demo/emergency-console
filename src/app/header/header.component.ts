import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { IconDefinition, faShieldAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { AlertModel } from '../models/alert-model';
import { AlertService } from '../services/alert.service';
import { KeycloakService } from 'keycloak-angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppUtil } from '../app-util';

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

  constructor(private alertService: AlertService, private renderer: Renderer2, private keycloak: KeycloakService, private router: Router) {
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

  setSidebar(enabled: boolean): void {
    this.sidebarVisible = enabled;
    if (this.sidebarVisible === false) {
      this.renderer.removeClass(document.body, 'sidebar-show');
    } else {
      this.renderer.addClass(document.body, 'sidebar-show');
    }

    if (!AppUtil.isMobile()) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }

  toggleSidebar() {
    this.setSidebar(!this.sidebarVisible);
  }

  @HostListener('window:resize', ['$event'])
  checkForMobile(_?) {
    if (AppUtil.isMobile() && this.sidebarVisible) {
      this.setSidebar(false);
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (AppUtil.isMobile()) {
        this.setSidebar(false);
      }
    });

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
