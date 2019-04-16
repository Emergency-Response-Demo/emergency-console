import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { from } from 'rxjs/internal/observable/from';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Mission } from '../mission';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapUrl = 'mission-service/api/missions';

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(this.mapUrl).pipe(
      catchError(err => this.handleError('getMissions()', err))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return from(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) {}
}
