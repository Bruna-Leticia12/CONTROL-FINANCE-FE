import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BankAccount {
    name: string;
    color: string;
    isConnected: boolean;
    lastSync?: Date;
}

@Component({
    selector: 'app-bank-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bank-card.component.html',
    styleUrls: ['./bank-card.component.scss']
})
export class BankCardComponent {
    @Input() account!: BankAccount;
    @Output() connectClick = new EventEmitter<string>();

    onConnect(): void {
        this.connectClick.emit(this.account.name);
    }

    getStatusText(): string {
        return this.account.isConnected ? 'Conectado' : 'Não conectado';
    }

    getLastSyncText(): string {
        if (!this.account.lastSync) return '';
        const now = new Date();
        const diff = now.getTime() - this.account.lastSync.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `há ${minutes} min`;
        if (hours < 24) return `há ${hours}h`;
        return `há ${days}d`;
    }
}
