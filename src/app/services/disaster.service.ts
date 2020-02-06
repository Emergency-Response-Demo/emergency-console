import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Shelter } from '../models/shelter';
import { InclusionZone } from '../models/inclusion-zone';
import { DisasterCenter } from '../models/disasterCenter';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
    async getShelters(): Promise<Shelter[]> {
      return this.http.get<Shelter[]>('/disaster-service/shelters').pipe(
        catchError(res => this.handleError('getShelters()', res))
      ).toPromise();
    }

    async getInclusionZones(): Promise<InclusionZone[]> {
      return this.http.get<Shelter[]>('/disaster-service/inclusion-zones').pipe(
        catchError(res => this.handleError('getInclusionZones()', res))
      ).toPromise();
    }

    async getDisasterCenter(): Promise<DisasterCenter> {
      return this.http.get<Shelter[]>('/disaster-service/center').pipe(
        catchError(res => this.handleError('getInclusionZones()', res))
      ).toPromise();
    }

    private handleError(method: string, res: HttpErrorResponse): Observable<any> {
      this.messageService.error(`${method} ${res.message}`);
      console.error(res.error);
      return of(null);
    }

    constructor(private messageService: MessageService, private http: HttpClient) { }
}
