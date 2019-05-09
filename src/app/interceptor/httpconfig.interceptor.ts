import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable() export class HttpConfigInterceptor implements HttpInterceptor { 

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(environment.isGatewayEnabled){
            let service = request.url.substr(0, request.url.indexOf("/"));
            if (environment.servicesNames.includes(service)){
                request = request.clone({ 
                    setHeaders: {
                        "user-key": environment.service.get(service)
                    }
                });
            }
        }

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }));
    }

}
