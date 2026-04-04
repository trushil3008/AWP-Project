import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator;
  @ViewChild(MatSort) sort;

  filterForm;
  dataSource;
  displayedColumns = ['name', 'email', 'accountNumber', 'balance', 'status', 'createdAt', 'actions'];
  isLoading = true;

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'frozen', label: 'Frozen' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource([]);
  }

  ngOnInit() {
    this.initFilterForm();
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['']
    });
  }

  loadUsers() {
    this.isLoading = true;

    this.adminService.getUsers(this.filterForm.value).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.data || response || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    this.dataSource.data = [
      { id: 1, name: 'John Doe', email: 'john@example.com', accountNumber: '1234567890', balance: 25480.50, status: 'active', createdAt: '2023-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', accountNumber: '0987654321', balance: 12350.75, status: 'active', createdAt: '2023-02-20' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', accountNumber: '5555666677', balance: 5890.00, status: 'frozen', createdAt: '2023-03-10' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', accountNumber: '1111222233', balance: 45000.00, status: 'active', createdAt: '2023-04-05' },
      { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', accountNumber: '9999888877', balance: 780.25, status: 'active', createdAt: '2023-05-12' }
    ];
  }

  applySearch(event) {
    const filterValue = event.target.value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  applyFilters() {
    this.loadUsers();
  }

  toggleAccountStatus(user) {
    const action = user.status === 'active' ? 'freeze' : 'unfreeze';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action === 'freeze' ? 'Freeze' : 'Unfreeze'} Account`,
        message: `Are you sure you want to ${action} ${user.name}'s account?`,
        type: action === 'freeze' ? 'danger' : 'info',
        confirmText: action === 'freeze' ? 'Freeze Account' : 'Unfreeze Account',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const accountId = user.accountId || user.id;
        const request = action === 'freeze' 
          ? this.adminService.freezeAccount(accountId)
          : this.adminService.unfreezeAccount(accountId);

        request.subscribe({
          next: () => {
            user.status = action === 'freeze' ? 'frozen' : 'active';
            this.notificationService.success(`Account ${action}d successfully`);
          },
          error: () => {}
        });
      }
    });
  }
}
