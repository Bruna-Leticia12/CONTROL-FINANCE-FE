import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenKey = 'ctrlf_token';
  const skipPaths = ['/login', '/register'];
  const shouldSkip = skipPaths.some(p => req.url.includes(p));
  const router = inject(Router);
  
  if (shouldSkip) {
    console.log('[AuthInterceptor] Pulando autenticação para:', req.url);
    return next(req);
  }

  const token = localStorage.getItem(tokenKey);
  console.log('[AuthInterceptor] Token encontrado?', !!token);
  console.log('[AuthInterceptor] URL:', req.url);
  
  if (token && isTokenExpired(token)) {
    console.error(' [AuthInterceptor] Token expirado! Redirecionando para login...');
    handleTokenExpired(router);
    return throwError(() => new Error('Token expirado'));
  }
  
  if (token) {
    console.log('[AuthInterceptor] Adicionando token ao header');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('[AuthInterceptor] Erro 401 - Token inválido ou expirado');
          handleTokenExpired(router);
        }
        return throwError(() => error);
      })
    );
  }

  console.warn('[AuthInterceptor] Nenhum token encontrado - enviando requisição sem autenticação');
  return next(req);
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.error('[AuthInterceptor] Erro ao verificar token:', error);
    return true;
  }
}

function decodeToken(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token JWT inválido');
  }
  
  const payload = parts[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}


function handleTokenExpired(router: Router): void {
  localStorage.removeItem('ctrlf_token');
  sessionStorage.clear();
  console.warn('Sua sessão expirou. Por favor, faça login novamente.');
  router.navigate(['/login'], {
    queryParams: { expired: 'true' }
  });
}