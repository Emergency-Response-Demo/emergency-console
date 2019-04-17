import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { LngLat } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  getDirections(start: LngLat, end: LngLat) {
    const url = `/mapbox/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}.json`;
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
