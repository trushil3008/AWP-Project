import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultDuration = 4000;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  success(message, action = 'Close', duration = this.defaultDuration) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error notification
   */
  error(message, action = 'Close', duration = this.defaultDuration) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Show warning notification
   */
  warning(message, action = 'Close', duration = this.defaultDuration) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }

  /**
   * Show info notification
   */
  info(message, action = 'Close', duration = this.defaultDuration) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Show generic notification
   */
  show(message, action = 'Close', duration = this.defaultDuration) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /**
   * Dismiss current notification
   */
  dismiss() {
    this.snackBar.dismiss();
  }
}
