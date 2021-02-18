import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { Shelter } from '../models/shelter';
import { Mission } from '../models/mission';
import { Responder } from '../models/responder';
import { Incident } from '../models/incident';
import { CloudEvent} from '../cloudevents/cloudevent';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  async getMissions(): Promise<Mission[]> {
    const url = 'mission-service/api/missions';
    return this.http.get<Mission[]>(url).pipe(
      catchError(err => this.handleError('getMissions()', err))
    ).toPromise();
  }

  async getByResponder(responder: Responder): Promise<Mission> {
    const url = `mission-service/api/missions/responders/${responder.id}`;
    return this.http.get<Mission[]>(url).pipe(
      catchError(err => this.handleError('getByResponder()', err))
    ).toPromise();
  }

  watch(): Observable<Mission> {
    return Observable.create(observer => {
      this.socket.on('topic-mission-event', (event: CloudEvent) => {
        if (!event.data) {
          return;
        }        
        observer.next(event.data);
      });
    });
  }

  watchByResponder(responder: Responder): Observable<Mission> {
    return Observable.create(observer => {
      this.socket.on('topic-mission-event', (event: CloudEvent) => {
        if (!event.data) {
          return;
        }
        const mission = event.data as Mission;
        if (`${mission.responderId}` !== `${responder.id}`) {
          return;
        }
        observer.next(mission);
      });
    });
  }

  async getDirections(responder: Responder, incident: Incident, shelter: Shelter): Promise<any> {
    const params = `${responder.longitude},${responder.latitude};${incident.lon},${incident.lat};${shelter.lon},${shelter.lat}`;
    const url = `/mapbox/directions/v5/mapbox/driving/${params}.json`;
    const httpParams = new HttpParams()
      .set('access_token', window['_env'].accessToken)
      .set('geometries', 'geojson');

    return this.http.get<any>(url, { params: httpParams }).pipe(
      catchError(res => this.handleError('getDirections()', res))
    ).toPromise();
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    return of(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient, private socket: Socket) { }
}
