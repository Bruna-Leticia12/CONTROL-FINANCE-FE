import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterOutlet],
  template: `
    <ng-container *ngIf="showHeader">
      <app-header></app-header>
    </ng-container>

    <main class="main-content" [class.no-header]="!showHeader">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .main-content {
      padding-top: 84px;
      display: flex;
      justify-content: center;
      padding-left: 16px;
      padding-right: 16px;
      box-sizing: border-box;
      background: #f5f7fa;
      height: 100vh;
      overflow-y: auto;
    }

    .main-content.no-header {
      padding-top: 0;
      background: #fff;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  showHeader = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const current = this.router.url;
        this.showHeader = !(
          current.startsWith('/login') ||
          current.startsWith('/register')
        );
      });
  }
}