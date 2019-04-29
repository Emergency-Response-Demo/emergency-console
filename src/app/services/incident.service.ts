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

  getReported(): Observable<Incident[]> {
    const url = 'incident-service/incidents/reported';
    return this.http.get<Incident[]>(url).pipe(
      catchError(res => this.handleError('getReported()', res))
    );
  }

  getById(id: string): Observable<Incident> {
    const url = `incident-service/incidents/incident/${id}`;
    return this.http.get<Incident>(url).pipe(
      catchError(res => this.handleError('getById()', res))
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
