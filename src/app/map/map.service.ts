import { Injectable } from '@angular/core';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { from } from 'rxjs/internal/observable/from';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapUrl = 'mission-service/api/missions';

  getIds(): Observable<string[]> {
    return this.http.get<string[]>(this.mapUrl);
  }

  getMissions(ids: string[]): Observable<any> {
    return from(ids).pipe(
      mergeMap(id => this.http.get(`${this.mapUrl}/${id}`)),
      catchError(res => this.handleError('getMissions()', res))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return from(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) {}
}
