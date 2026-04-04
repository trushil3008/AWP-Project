import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { TransactionService } from '../../services/transaction.service';
import { BeneficiaryService } from '../../../beneficiaries/services/beneficiary.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-schedule-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './schedule-transfer.component.html',
  styleUrl: './schedule-transfer.component.css'
})
export class ScheduleTransferComponent implements OnInit {
  scheduleForm;
  beneficiaries = [];
  scheduledTransfers = [];
  isLoading = false;
  isLoadingScheduled = true;
  minDate = new Date();

  displayedColumns = ['beneficiary', 'amount', 'scheduledDate', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private beneficiaryService: BeneficiaryService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadBeneficiaries();
    this.loadScheduledTransfers();
    
    // Set minimum date to tomorrow
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  initForm() {
    this.scheduleForm = this.fb.group({
      beneficiaryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      scheduledDate: ['', Validators.required],
      description: ['', Validators.maxLength(100)]
    });
  }

  loadBeneficiaries() {
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (response: any) => {
        this.beneficiaries = response.data || response || [];
      },
      error: () => {
        this.beneficiaries = [
          { id: 1, name: 'John Doe', accountNumber: '9876543210' },
          { id: 2, name: 'Jane Smith', accountNumber: '1234567890' },
          { id: 3, name: 'Bob Wilson', accountNumber: '5555666677' }
        ];
      }
    });
  }

  loadScheduledTransfers() {
    this.isLoadingScheduled = true;

    this.transactionService.getScheduledTransfers().subscribe({
      next: (response: any) => {
        this.scheduledTransfers = response?.scheduledTransactions || response || [];
        this.isLoadingScheduled = false;
      },
      error: () => {
        this.isLoadingScheduled = false;
        this.scheduledTransfers = [
          {
            id: 1,
            beneficiary: { name: 'John Doe', accountNumber: '9876543210' },
            amount: 500,
            scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            status: 'scheduled'
          },
          {
            id: 2,
            beneficiary: { name: 'Jane Smith', accountNumber: '1234567890' },
            amount: 250,
            scheduledDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            status: 'scheduled'
          }
        ];
      }
    });
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.scheduleForm.value;
    const beneficiary = this.beneficiaries.find(b => b.id === formValue.beneficiaryId);

    const transferData = {
        receiverAccount: beneficiary?.accountNumber,
      amount: formValue.amount,
      scheduledDate: formValue.scheduledDate.toISOString(),
      description: formValue.description || 'Scheduled Transfer'
    };

    this.transactionService.scheduleTransfer(transferData).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Transfer scheduled successfully!');
        this.scheduleForm.reset();
        this.loadScheduledTransfers();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  cancelScheduledTransfer(transfer) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Scheduled Transfer',
        message: `Are you sure you want to cancel the scheduled transfer of ${transfer.amount} to ${transfer.receiverName || 'recipient'}?`,
        type: 'danger',
        confirmText: 'Cancel Transfer',
        cancelText: 'Keep It'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transactionService.cancelScheduledTransfer(transfer.id).subscribe({
          next: () => {
            this.notificationService.success('Scheduled transfer cancelled');
            this.loadScheduledTransfers();
          },
          error: () => {}
        });
      }
    });
  }

  getBeneficiaryName(id) {
    const b = this.beneficiaries.find(b => b.id === id);
    return b ? b.name : 'Unknown';
  }
}
