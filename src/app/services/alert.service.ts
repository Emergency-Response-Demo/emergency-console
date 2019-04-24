import { Injectable } from '@angular/core';
import { AlertModel } from '../models/alert-model';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // private alertsUrl = 'api/alertMock';
  private alertsUrl = 'alert-service/alerts';

  getAlerts() {
    return this.http.get<AlertModel[]>(this.alertsUrl).pipe(
      catchError(res => {
        return this.handleError('getAlerts()', res);
      })
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}
}
