import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AiService } from '../../services/ai.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ai-agent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ai-agent.component.html',
  styleUrls: ['./ai-agent.component.scss']
})
export class AiAgentComponent {
  isChatOpen = false;
  mensagens: { de: 'user'|'ia'; texto: string }[] = [];
  novoPrompt = '';
  isLoading = false;

  constructor(private aiService: AiService) {}

  toggleChat() { this.isChatOpen = !this.isChatOpen; }

  enviarMensagem() {
    const prompt = this.novoPrompt?.trim();
    if (!prompt) return;
    this.mensagens.push({ de: 'user', texto: prompt });
    this.novoPrompt = '';
    this.isLoading = true;
    this.aiService.enviarPrompt(prompt).pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: answer => this.mensagens.push({ de: 'ia', texto: answer }),
        error: () => this.mensagens.push({ de: 'ia', texto: 'Erro ao consultar o assistente.' })
      });
  }
}