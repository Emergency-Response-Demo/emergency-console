import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { MessageService } from './message.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Incident } from '../models/incident';
import { Socket } from 'ngx-socket-io';
import { TopicIncidentCommand } from '../models/topic';
import { CloudEvent} from '../cloudevents/cloudevent';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  async getById(id): Promise<Incident> {
    const url = `incident-service/incidents/incident/${id}`;
    return this.http.get<Incident>(url).pipe(
      catchError(res => this.handleError('getById()', res))
    ).toPromise();
  }

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

  watch(types?: string[]): Observable<Incident> {
    const incidentEventTopic = 'topic-incident-event';
    const incidentCommandTopic = 'topic-incident-command';
    return Observable.create(observer => {
      this.socket.on(incidentEventTopic, (event: CloudEvent) => {
        if (!event.data || (!!types && !types.includes(event.type))) {
           return;
        }
        observer.next(event.data);
      });
      this.socket.on(incidentCommandTopic, (event: CloudEvent) => {
        const incidentCommand = event.data as TopicIncidentCommand;
        if (!event.data || !incidentCommand.incident || (!!types && !types.includes(event.type))) {
          return;
        }
        observer.next(incidentCommand.incident);
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
