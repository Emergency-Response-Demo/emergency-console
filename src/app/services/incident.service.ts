import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { MessageService } from './message.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Incident } from '../models/incident';
import { Socket } from 'ngx-socket-io';
import { TopicIncidentEvent, TopicIncidentCommand } from '../models/topic';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  async getAll(): Promise<Incident[]> {
    const url = 'incident-service/incidents';
    return this.http.get<Incident[]>(url).pipe(
      catchError(res => this.handleError('getReported()', res))
    ).toPromise();
  }

  async getReported(): Promise<Incident[]> {
    const url = 'incident-service/incidents/reported';
    return this.http.get<Incident[]>(url).pipe(
      catchError(res => this.handleError('getReported()', res))
    ).toPromise();
  }

  getById(id: string): Observable<Incident> {
    const url = `incident-service/incidents/incident/${id}`;
    return this.http.get<Incident>(url).pipe(
      catchError(res => this.handleError('getById()', res))
    );
  }

  watch(types?: string[]): Observable<Incident> {
    const incidentEventTopic = 'topic-incident-event';
    const incidentCommandTopic = 'topic-incident-command';
    return Observable.create(observer => {
      this.socket.on(incidentEventTopic, (msg: TopicIncidentEvent) => {
        if (!msg.body || (!!types && !types.includes(msg.messageType))) {
           return;
        }
        observer.next(msg.body);
      });
      this.socket.on(incidentCommandTopic, (msg: TopicIncidentCommand) => {
        if (!msg.body || !msg.body.incident || (!!types && !types.includes(msg.messageType))) {
          return;
        }
        observer.next(msg.body.incident);
      });
    });
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private socket: Socket
  ) {}
}
