import { Injectable } from '@angular/core';
import { IncidentStatus } from './incident-status';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { MessageService } from '../message/message.service';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})
export class IncidentStatusService {

  // private statusUrl = 'api/incidentStatus';
  private statusUrl = 'incident-service/incidents/stats';

  getStatus() {
    return this.http.get<IncidentStatus>(this.statusUrl).pipe(
      catchError(res => {
        return this.handleError('getStatus()', res);
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
