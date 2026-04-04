import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay" [class.inline]="!overlay">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .loading-container.inline {
      padding: var(--spacing-xl);
    }

    .loading-message {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay = false;
  @Input() diameter = 40;
  @Input() message = '';
}
