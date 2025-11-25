import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const isLoggedIn = this.authService.isLoggedIn();

        if (isLoggedIn) {
            console.log('✅ [AuthGuard] Acesso permitido');
            return true;
        }

        // Não está logado ou token expirado, redireciona para login
        console.warn('🚫 [AuthGuard] Acesso negado - usuário não autenticado ou token expirado');
        
        this.router.navigate(['/login'], {
            queryParams: { 
                expired: 'true',
                returnUrl: state.url 
            }
        });
        
        return false;
    }
}
