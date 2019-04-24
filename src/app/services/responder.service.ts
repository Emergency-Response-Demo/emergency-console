import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from './message.service';
import { of } from 'rxjs/internal/observable/of';
import { Responder } from '../models/responder';

@Injectable({
  providedIn: 'root'
})
export class ResponderService {
  private url = 'responder-service/responder';

  getAvailable(): Observable<Responder[]> {
    const url = 'responder-service/responders/available';
    return this.http.get<Responder[]>(url).pipe(
      catchError(res => this.handleError('getAvailable()', res))
    );
  }

  getResponder(name: string): Observable<Responder> {
    const url = `responder-service/responder/byname/${name}`;
    return this.http.get<Responder>(url).pipe(
      catchError(res => this.handleError('getResponder()', res))
    );
  }

  private handleError(method: string, res: HttpErrorResponse): Observable<any> {
    if (res.status === 404 && method === 'getResponder()') {
      return of(new Responder());
    } else {
      this.messageService.error(`${method} ${res.message}`);
      console.error(res.error);
      return of(null);
    }
  }

  constructor(private messageService: MessageService, private http: HttpClient) { }
}
