import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { AlertModel } from './alerts/alert-model';
import { IncidentStatus } from './incident/incident-status';
import { Responders } from './charts/responders';

@Injectable({
  providedIn: 'root'
})
export class InMemoryApiService implements InMemoryDbService {
  createDb() {
    // tslint:disable-next-line:prefer-const
    let alertMock: AlertModel[] = [
      {
        type: 'success',
        message: `You successfully read this important alert message.`
      },
      {
        type: 'info',
        message: `This alert needs your attention, but it's not super important.`
      },
      {
        type: 'danger',
        message: `Better check yourself, you're not looking too good.`
      }
    ];

    // tslint:disable-next-line:prefer-const
    let incidentMock: IncidentStatus = {
      requested: 23,
      assigned: 6,
      pickedUp: 38,
      rescued: 104,
      cancelled: 34
    };

    // tslint:disable-next-line:prefer-const
    let responderMock: Responders = {
      active: 40,
      total: 100
    };

    return { alertMock, incidentMock, responderMock };
  }
}
