import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { AlertModel } from './alerts/alert-model';

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
    return { alerts };
  }
}
