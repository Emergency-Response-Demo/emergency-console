import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  getDirections(start: number[], end: number[]) {
    const accessToken = window['_env'].accessToken;
    const url = `/mapbox/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}.json?access_token=${accessToken}&geometries=geojson`;
    return this.http.get<any>(url).pipe(
      catchError(res => {
        return this.handleError('getDirections()', res);
      })
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) {}
}
