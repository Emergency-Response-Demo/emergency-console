import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { faEraser, faSignOutAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from '../keycloak.service';
import { AlertModel } from '../alerts/alert-model';
import { AlertService } from '../alerts/alert.service';

@Component({
  styleUrls: ['./header.component.css'],
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  eraseIcon: IconDefinition;
  logoutIcon: IconDefinition;
  formIcon: IconDefinition;
  sidebarVisible: boolean;
  username: string;
  alerts: AlertModel[];
  logoutUrl: string;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (this.sidebarVisible === false) {
      this.renderer.removeClass(document.body, 'sidebar-show');
    } else {
      this.renderer.addClass(document.body, 'sidebar-show');
    }
  }

  @HostListener('window:resize', ['$event'])
  checkForMobile(event?) {
    if (window.innerWidth < 640) {
      this.toggleSidebar();
    }
  }

  constructor(private alertService: AlertService, private renderer: Renderer2, private keycloakService: KeycloakService) {
    this.eraseIcon = faEraser;
    this.logoutIcon = faSignOutAlt;
    this.sidebarVisible = true;
    this.alerts = new Array();
    this.username = '';

    // hide sidebar by default on mobile
    this.checkForMobile();
  }

  ngOnInit(): void {
    this.alertService.getAlerts().subscribe(res => {
      this.alerts = res.map((alert: AlertModel) => {
        alert.type = `text-${alert.type}`;
        return alert;
      });
    });

    const auth = this.keycloakService.getAuth();

    if (auth.loggedIn) {
      this.logoutUrl = auth.logoutUrl;
    }
  }
}
