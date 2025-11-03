import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder">
      <h3>Transações</h3>
      <p>Em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .placeholder { width:100%; max-width:900px; margin: 10px auto; padding: 24px; background:#fff; border-radius:8px; box-shadow:0 8px 18px rgba(0,0,0,0.06); }
  `]
})
export class TransacoesComponent {}