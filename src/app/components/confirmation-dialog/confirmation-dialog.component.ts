import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  password: string = '';

  constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  onAllow(): void {
    if (this.password.trim()) {
      this.dialogRef.close(this.password);
    }
  }

  onDeny(): void {
    this.dialogRef.close(false);
  }
}