import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from '../message/message.service';
import { of } from 'rxjs/internal/observable/of';
import { Responder } from '../responder';

@Injectable({
  providedIn: 'root'
})
export class ResponderService {
  private respondersUrl = 'responder-service/responders/available';

  getAvailable(): Observable<Responder[]> {
    return this.http.get<Responder[]>(this.respondersUrl).pipe(
      catchError(res => this.handleError('getAvailable()', res))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(private messageService: MessageService, private http: HttpClient) {}
}
