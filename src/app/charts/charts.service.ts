import { Injectable } from '@angular/core';
import { Responders } from './responders';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from '../message/message.service';
import { of } from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  private respondersUrl = 'api/responders';

  getStatus() {
    return this.http.get<Responders>(this.respondersUrl).pipe(
      catchError(res => {
        return this.handleError('getStatus()', res);
      })
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    this.messageService.error(`${method} ${res.message}`);
    console.error(res.error);
    return of(null);
  }

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}
}
