import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterSimulatorService {
    async clearResponders(): Promise<any> {
      return this.http.get<JSON>('/disaster-simulator/c/responders?clearResponders=true').pipe(
        catchError(res => this.handleError('clearResponders()', res))
      ).toPromise();
    }

    async generateIncidents(): Promise<any> {
      return this.http.get<JSON>('/disaster-simulator/g/incidents?incidents=50').pipe(
        catchError(res => this.handleError('generateIncidents()', res))
      ).toPromise();
    }

    async generateResponders(): Promise<any> {
      return this.http.get<JSON>('/disaster-simulator/g/responders').pipe(
        catchError(res => this.handleError('generateResponders()', res))
      ).toPromise();
    }

    private handleError(method: string, res: HttpErrorResponse): Observable<any> {
      this.messageService.error(`${method} ${res.message}`);
      console.error(res.error);
      return of(null);
    }

    constructor(private messageService: MessageService, private http: HttpClient) { }
}
