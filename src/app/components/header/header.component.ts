import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  userName = 'Usuário';
  currentPath = '';

  allMenuItems: MenuItem[] = [
    { label: 'BALANÇO GERAL', path: '/dashboard' },
    { label: 'MINHAS CONTAS', path: '/my-accounts' },
    { label: 'METAS', path: '/metas' },
    { label: 'TRANSAÇÕES', path: '/transacoes' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Buscar nome do usuário
    this.loadUserName();

    // Atualizar path atual
    this.currentPath = this.router.url;

    // Escutar mudanças de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
    });
  }

  loadUserName(): void {
    // Tentar pegar do sessionStorage primeiro
    const cachedName = sessionStorage.getItem('userName');
    if (cachedName) {
      this.userName = cachedName;
    } else {
      // Buscar do backend
      this.authService.getUserProfile().subscribe({
        next: (user) => {
          const firstName = user.name.split(' ')[0];
          this.userName = firstName;
        },
        error: (err) => {
          console.warn('⚠️ Erro ao carregar nome do usuário:', err);
        }
      });
    }
  }

  get filteredMenuItems(): MenuItem[] {
    // Filtrar item da página atual
    return this.allMenuItems.filter(item => item.path !== this.currentPath);
  }

  get showUserMenu(): boolean {
    // Mostrar menu em todas as páginas autenticadas
    const publicRoutes = ['/login', '/register'];
    return !publicRoutes.includes(this.currentPath);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigate(path: string) {
    this.menuOpen = false;
    this.router.navigate([path]);
  }

  logout() {
    this.menuOpen = false;

    // Limpa TUDO: localStorage + sessionStorage
    this.authService.logout();

    // Redireciona para login
    this.router.navigate(['/login']);
  }

  hideImage(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }
}