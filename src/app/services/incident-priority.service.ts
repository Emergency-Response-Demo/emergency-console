import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { PriorityZone } from '../models/priority-zone';

@Injectable({
  providedIn: 'root'
})
export class IncidentPriorityService {
    async getPriorityZones(): Promise<PriorityZone[]> {
      return this.http.get<PriorityZone[]>('/incident-priority-service/priority-zones').pipe(
        catchError(res => this.handleError('getPriorityZones()', res))
      ).toPromise();
    }

    private handleError(method: string, res: HttpErrorResponse): Observable<any> {
      this.messageService.error(`${method} ${res.message}`);
      console.error(res.error);
      return of(null);
    }

    constructor(private messageService: MessageService, private http: HttpClient) { }
}
