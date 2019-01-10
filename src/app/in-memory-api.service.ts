import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { AlertModel } from './alerts/alert-model';
import { IncidentStatus } from './incident-status/incident-status';
import { Responders } from './charts/responders';

@Injectable({
  providedIn: 'root'
})
export class InMemoryApiService implements InMemoryDbService {
  createDb() {
    // tslint:disable-next-line:prefer-const
    let alerts: AlertModel[] = [
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

    // tslint:disable-next-line:prefer-const
    let incidentStatus: IncidentStatus = {
      requested: 23,
      claimed: 6,
      pickedUp: 38,
      rescued: 104
    };

    // tslint:disable-next-line:prefer-const
    let responders: Responders = {
      active: 40,
      idle: 60
    };

    return { alerts, incidentStatus, responders };
  }
}
