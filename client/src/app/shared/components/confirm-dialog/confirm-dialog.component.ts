import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [ngClass]="data.type || 'warning'">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>
      
      <h2 mat-dialog-title>{{ data.title || 'Confirm Action' }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message || 'Are you sure you want to proceed?' }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button [color]="getButtonColor()" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: var(--spacing-md);
    }

    .dialog-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-md);
    }

    .dialog-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-icon.warning {
      background-color: rgba(255, 152, 0, 0.15);
      color: var(--warning-color);
    }

    .dialog-icon.danger {
      background-color: rgba(244, 67, 54, 0.15);
      color: var(--error-color);
    }

    .dialog-icon.info {
      background-color: rgba(33, 150, 243, 0.15);
      color: var(--info-color);
    }

    .dialog-icon.success {
      background-color: rgba(76, 175, 80, 0.15);
      color: var(--success-color);
    }

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
    }

    mat-dialog-actions {
      justify-content: center;
      gap: var(--spacing-sm);
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getIcon() {
    const icons = {
      warning: 'warning',
      danger: 'error',
      info: 'info',
      success: 'check_circle'
    };
    return icons[this.data.type] || 'help';
  }

  getButtonColor() {
    return this.data.type === 'danger' ? 'warn' : 'primary';
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
