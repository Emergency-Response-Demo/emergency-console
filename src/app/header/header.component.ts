import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { IconDefinition, faShieldAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from '../keycloak.service';
import { AlertModel } from '../alerts/alert-model';
import { AlertService } from '../alerts/alert.service';
import { interval } from 'rxjs/internal/observable/interval';

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
  logoutUrl: string;
  accountUrl: string;

  constructor(private alertService: AlertService, private renderer: Renderer2, private keycloakService: KeycloakService) {
    this.logoutIcon = faLock;
    this.accountIcon = faShieldAlt;
    this.sidebarVisible = true;
    this.alerts = new Array();
    this.username = '';

    // hide sidebar by default on mobile
    this.checkForMobile();
  }

  doLogout(): void {
    window.location.href = this.logoutUrl;
  }

  doAccount(): void {
    window.open(this.accountUrl, '_blank');
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

    const auth = this.keycloakService.getAuth();

    if (auth.isLoggedIn) {
      this.username = auth.profile.username;
      this.logoutUrl = auth.logoutUrl;
      this.accountUrl = auth.accountUrl;
    }
  }
}
