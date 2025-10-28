import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Welcome to Ctrl + F!</h1>
      <p>Test.</p>
    </div>
  `,
  styles: [`
    .dashboard {
      text-align: center;
      padding: 50px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  `]
})
export class DashboardComponent {}
