import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
    @Input() title: string = 'Nenhum dado disponível';
    @Input() description: string = 'Conecte uma conta bancária para visualizar seus dados financeiros';
    @Input() icon: 'chart' | 'bank' | 'transaction' = 'chart';
    @Input() showCta: boolean = true;

    get hasActiveConnection(): boolean {
        const connectionId = sessionStorage.getItem('connectionId');
        return !!connectionId && connectionId !== 'null';
    }

    get ctaText(): string {
        return this.hasActiveConnection ? 'Visualizar contas' : 'Conectar banco';
    }
}
