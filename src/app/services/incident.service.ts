import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { MessageService } from './message.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Incident } from '../models/incident';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  private reportedUrl = 'incident-service/incidents/reported';

  getReported(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.reportedUrl).pipe(
      catchError(res => this.handleError('getReported()', res))
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
