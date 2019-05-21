import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  getAlerts() {
    return [{
      type: 'danger',
      message: 'Severe weather alert! Flooding due to hurricane.'
    }];
  }
}
