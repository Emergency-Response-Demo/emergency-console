import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {MessageService} from '../message/message.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Config} from 'codelyzer';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private messageService: MessageService, private http: HttpClient) {
  }

  getJBoss(): Observable<HttpResponse<Config>> {
    return this.http.get<Config>('/jboss-api/status', {observe: 'response'})
      .pipe(
        catchError(error => {
          this.messageService.error(`getJBoss() ${error.message}`);
          return of(error);
        })
      );
  }

  getSpring(): Observable<HttpResponse<Config>> {
    return this.http.get<Config>('/springboot-api/', {observe: 'response'})
      .pipe(
        catchError(error => {
          this.messageService.error(`getSpring() ${error.message}`);
          return of(error);
        })
      );
  }

}
