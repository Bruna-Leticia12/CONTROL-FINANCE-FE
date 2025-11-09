import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private tokenKey = 'ctrlf_token';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipPaths = ['/login', '/register'];
    const shouldSkip = skipPaths.some(p => req.url.includes(p));
    if (shouldSkip) {
      return next.handle(req);
    }

    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}