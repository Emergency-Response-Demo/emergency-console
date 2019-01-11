import { Component, OnInit } from '@angular/core';
import { IconDefinition, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { AlertModel } from './alert-model';
import { AlertService } from './alert.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  alertIcon: IconDefinition;
  alerts: AlertModel[];

  constructor(private alertService: AlertService, private dashboardService: DashboardService) {
    this.alerts = new Array();
    this.dashboardService.reload$.subscribe(res => {
      console.log(`Alert component ${res}`);
      this.load();
    });
  }

  load(): void {
    this.alertService.getAlerts().subscribe(res => {
      this.alerts = res;
    });
  }

  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  ngOnInit() {
    this.alertIcon = faExclamationTriangle;
    this.load();
  }
}
