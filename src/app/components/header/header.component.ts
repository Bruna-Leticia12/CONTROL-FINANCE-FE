import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigate(path: string) {
    this.menuOpen = false;
    this.router.navigate([path]);
  }

  logout() {
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }

    hideImage(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }
}