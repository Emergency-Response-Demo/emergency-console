import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { Shelter } from '../models/shelter';
import { Mission } from '../models/mission';
import { Responder } from '../models/responder';
import { Incident } from '../models/incident';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private mapUrl = 'mission-service/api/missions';
  // private mapUrl = 'assets/data/mission-service.json';

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(this.mapUrl).pipe(
      catchError(err => this.handleError('getMissions()', err))
    );
  }

  getDirections(responder: Responder, incident: Incident, shelter: Shelter) {
    const params = `${responder.longitude},${responder.latitude};${incident.lon},${incident.lat};${shelter.lon},${shelter.lat}`;
    const url = `/mapbox/directions/v5/mapbox/driving/${params}.json`;
    const httpParams = new HttpParams()
      .set('access_token', window['_env'].accessToken)
      .set('geometries', 'geojson');

    return this.http.get<any>(url, { params: httpParams }).pipe(
      catchError(res => this.handleError('getDirections()', res))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    return of(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) { }
}
