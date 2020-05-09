import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { MessageService } from './message.service';
import { of } from 'rxjs/internal/observable/of';
import { Responder } from '../models/responder';
import { Socket } from 'ngx-socket-io';
import { ResponderTotalStatus } from '../models/responder-status';
import { TopicResponderEvent, TopicResponderCommand, TopicResponderCreateEvent, TopicResponderDeleteEvent } from '../models/topic';
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { AppUtil } from '../app-util';

@Injectable({
  providedIn: 'root'
})
export class ResponderService {

  constructor(private messageService: MessageService, private http: HttpClient, private socket: Socket) { }

  async getTotal(): Promise<ResponderTotalStatus> {
    const url = 'responder-service/stats';
    return this.http.get<ResponderTotalStatus>(url).pipe(
      catchError(res => this.handleError('getTotal()', res))
    ).toPromise();
  }

  async getAvailable(): Promise<Responder[]> {
    const url = 'responder-service/responders/available';
    return this.http.get<Responder[]>(url).pipe(
      catchError(res => this.handleError('getAvailable()', res))
    ).toPromise();
  }

  async getAllResponders(): Promise<Responder[]> {
    const url = 'responder-service/responders';
    return this.http.get<Responder[]>(url).pipe(
      catchError(res => this.handleError('getAllResponders()', res))
    ).toPromise();
  }

  async getById(id: number): Promise<Responder> {
    const url = `responder-service/responder/${id}`;
    return this.http.get<Responder>(url).pipe(
      AppUtil.retryWithBackoff(1000),
      catchError(res => this.handleError('getById()', res))
    ).toPromise();
  }

  async getByName(name: string): Promise<Responder> {
    const url = `responder-service/responder/byname/${name}`;
    return this.http.get<Responder>(url).pipe(
      catchError(res => this.handleError('getResponder()', res))
    ).toPromise();
  }

  async add(responder: Responder): Promise<any> {
    delete responder.id;
    const url = 'responder-service/responder';
    return this.http.post<any>(url, responder).pipe(
      catchError(res => this.handleError('add()', res))
    ).toPromise();
  }

  async update(responder: Responder): Promise<any> {
    const url = 'responder-service/responder';
    return this.http.put<any>(url, responder).pipe(
      catchError(res => this.handleError('update()', res))
    ).toPromise();
  }

  watchLocation(responder?: Responder): Observable<any> {
    return Observable.create(observer => {
      this.socket.on('topic-responder-location-update', msg => {
        if (!msg || (!!responder && msg.responderId !== `${responder.id}`)) {
          return;
        }
        observer.next(msg);
      });
    });
  }

  watchDeletes(): Observable<any> {
    return Observable.create(observer => {
      this.socket.on('topic-responder-event', (msg: TopicResponderDeleteEvent) => {
        if (!msg || msg.messageType !== 'RespondersDeletedEvent' || !msg.body || !msg.body.deleted) {
          return;
        }
        msg.body.responders.forEach(id => observer.next(id));
      });
    });
  }

  watchCreates(): Observable<any> {
    return Observable.create(observer => {
      this.socket.on('topic-responder-event', (msg: TopicResponderCreateEvent) => {
        if (!msg || msg.messageType !== 'RespondersCreatedEvent' || !msg.body || !msg.body.created) {
          return;
        }
        msg.body.responders.forEach(async (id) => {
          const responder = await this.getById(id);
          observer.next(responder);
        });
      });
    });
  }

  watch(): Observable<any> {
    return Observable.create(observer => {
      this.socket.on('topic-responder-event', (msg: TopicResponderEvent) => {
        if (!msg || !msg.body || !msg.body.responder) {
          return;
        }
        observer.next(msg.body.responder);
      });
      this.socket.on('topic-responder-command', (msg: TopicResponderCommand) => {
        if (!msg || !msg.body || !msg.body.responder) {
          return;
        }
        const { responder } = msg.body;
        // Clean the update to ensure we don't override any existing properties with null or undefined.
        Object.keys(responder).forEach(key => {
          if (responder[key] === undefined || responder[key] === null) {
            delete responder[key];
          }
        });
        observer.next(responder);
      });
    });
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
}
