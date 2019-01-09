import { Component, OnInit } from '@angular/core';
import { IconDefinition, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { AlertModel } from './alert-model';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {
  alertIcon: IconDefinition;
  alerts: AlertModel[];
  defaultAlerts: AlertModel[] = [
    {
      type: 'success',
      msg: `You successfully read this important alert message.`
    },
    {
      type: 'info',
      msg: `This alert needs your attention, but it's not super important.`
    },
    {
      type: 'danger',
      msg: `Better check yourself, you're not looking too good.`
    }
  ];

  constructor(private alertService: AlertService) {
    this.alerts = new Array();
  }

  onClosed(dismissedAlert: any): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  ngOnInit() {
    this.alertIcon = faExclamationTriangle;

    this.alertService.getAlerts().subscribe(res => {
      this.alerts = res;
    });
  }
}
