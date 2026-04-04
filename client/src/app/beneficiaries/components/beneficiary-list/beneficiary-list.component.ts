import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BeneficiaryService } from '../../services/beneficiary.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AccountNumberPipe } from '../../../shared/pipes/account-number.pipe';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    AccountNumberPipe
  ],
  templateUrl: './beneficiary-list.component.html',
  styleUrl: './beneficiary-list.component.css'
})
export class BeneficiaryListComponent implements OnInit {
  addForm;
  beneficiaries = [];
  isLoading = true;
  isAdding = false;
  showAddForm = false;

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadBeneficiaries();
  }

  initForm() {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      accountNumber: ['', [Validators.required, Validators.minLength(10)]],
      bankName: [''],
      nickname: ['']
    });
  }

  loadBeneficiaries() {
    this.isLoading = true;

    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (response: any) => {
        this.beneficiaries = response.data || response || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Load mock data
        this.beneficiaries = [
          { id: 1, name: 'John Doe', accountNumber: '9876543210123456', bankName: 'Chase Bank', nickname: 'John' },
          { id: 2, name: 'Jane Smith', accountNumber: '1234567890123456', bankName: 'Bank of America', nickname: 'Jane' },
          { id: 3, name: 'Bob Wilson', accountNumber: '5555666677778888', bankName: 'Wells Fargo', nickname: '' }
        ];
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addForm.reset();
    }
  }

  onSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const accountNumber = this.addForm.get('accountNumber').value;

    // Check for duplicates
    if (this.beneficiaryService.isDuplicate(accountNumber)) {
      this.notificationService.error('This beneficiary already exists');
      return;
    }

    this.isAdding = true;

    this.beneficiaryService.addBeneficiary(this.addForm.value).subscribe({
      next: (response) => {
        this.isAdding = false;
        this.notificationService.success('Beneficiary added successfully');
        this.addForm.reset();
        this.showAddForm = false;
        this.loadBeneficiaries();
      },
      error: () => {
        this.isAdding = false;
      }
    });
  }

  deleteBeneficiary(beneficiary) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Beneficiary',
        message: `Are you sure you want to remove ${beneficiary.name} from your beneficiaries?`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.beneficiaryService.deleteBeneficiary(beneficiary.id).subscribe({
          next: () => {
            this.notificationService.success('Beneficiary removed');
            this.loadBeneficiaries();
          },
          error: () => {}
        });
      }
    });
  }

  getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarColor(index) {
    const colors = [
      '#1a237e', '#0288d1', '#00897b', '#7b1fa2', 
      '#c62828', '#ef6c00', '#558b2f', '#6a1b9a'
    ];
    return colors[index % colors.length];
  }
}
