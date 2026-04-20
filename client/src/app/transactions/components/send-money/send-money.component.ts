import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

import { TransactionService } from '../../services/transaction.service';
import { BeneficiaryService } from '../../../beneficiaries/services/beneficiary.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    CurrencyFormatPipe
  ],
  templateUrl: './send-money.component.html',
  styleUrl: './send-money.component.css'
})
export class SendMoneyComponent implements OnInit {
  transferForm!: FormGroup;
  beneficiaries = [];
  isLoading = false;
  isLoadingBeneficiaries = true;
  transferMode = 'beneficiary'; // 'beneficiary' or 'account'
  showConfirmation = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private beneficiaryService: BeneficiaryService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadBeneficiaries();
  }

  initForm() {
    this.transferForm = this.fb.group({
      beneficiaryId: [''],
      accountNumber: [''],
      accountHolderName: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.maxLength(100)]]
    });
  }

  loadBeneficiaries() {
    this.isLoadingBeneficiaries = true;
    
    this.beneficiaryService.getBeneficiaries().subscribe({
      next: (response: any) => {
        this.beneficiaries = this.beneficiaryService.parseBeneficiariesResponse(response);
        this.isLoadingBeneficiaries = false;
      },
      error: (error) => {
        this.isLoadingBeneficiaries = false;
        this.beneficiaries = [];
      }
    });
  }

  onModeChange(mode) {
    this.transferMode = mode;
    this.transferForm.reset();
  }

  showConfirm() {
    if (this.transferMode === 'beneficiary' && !this.transferForm.get('beneficiaryId').value) {
      this.notificationService.error('Please select a beneficiary');
      return;
    }

    if (this.transferMode === 'account' && !this.transferForm.get('accountNumber').value) {
      this.notificationService.error('Please enter account number');
      return;
    }

    if (!this.transferForm.get('amount').value || this.transferForm.get('amount').invalid) {
      this.notificationService.error('Please enter a valid amount');
      return;
    }

    this.showConfirmation = true;
  }

  cancelConfirmation() {
    this.showConfirmation = false;
  }

  getSelectedBeneficiary() {
    const id = this.transferForm.get('beneficiaryId').value;
    return this.beneficiaries.find(b => b.id === id);
  }

  onSubmit() {
    this.isLoading = true;

    const formValue = this.transferForm.value;
    let transferData;

    if (this.transferMode === 'beneficiary') {
      const beneficiary = this.getSelectedBeneficiary();
      transferData = {
        receiverAccount: beneficiary?.accountNumber,
        amount: formValue.amount,
        description: formValue.description || 'Transfer'
      };
    } else {
      transferData = {
        receiverAccount: formValue.accountNumber,
        amount: formValue.amount,
        description: formValue.description || 'Transfer'
      };
    }

    this.transactionService.sendMoney(transferData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.success('Transfer completed successfully!');
        this.router.navigate(['/transactions/history']);
      },
      error: (error) => {
        this.isLoading = false;
        this.showConfirmation = false;
      }
    });
  }
}
