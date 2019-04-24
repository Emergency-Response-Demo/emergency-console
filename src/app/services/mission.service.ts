import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { LngLat } from 'mapbox-gl';
import { Shelter } from '../models/shelter';
import { Mission } from '../models/mission';

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

  getDirections(start: LngLat, incident: LngLat, shelter: Shelter) {
    const url = `/mapbox/directions/v5/mapbox/driving/${start.lng},${start.lat};${incident.lng},${incident.lat};${shelter.lon},${shelter.lat}.json`;
    const httpParams = new HttpParams()
      .set('access_token', window['_env'].accessToken)
      .set('geometries', 'geojson');

    return this.http.get<any>(url, { params: httpParams }).pipe(
      catchError(res => this.handleError('getDirections()', res))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) { }
}
