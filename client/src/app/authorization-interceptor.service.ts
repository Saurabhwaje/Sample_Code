// authorization-interceptor.service.ts

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('')
      },
    });
    return next.handle(modifiedReq);
  }
}
