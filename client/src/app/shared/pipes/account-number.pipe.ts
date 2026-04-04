import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountNumber',
  standalone: true
})
export class AccountNumberPipe implements PipeTransform {
  transform(value, mask = true) {
    if (!value) {
      return '';
    }

    const accountStr = value.toString();
    
    if (mask && accountStr.length > 4) {
      // Show only last 4 digits
      const lastFour = accountStr.slice(-4);
      const masked = '*'.repeat(accountStr.length - 4);
      return masked + lastFour;
    }

    // Format with spaces every 4 digits
    return accountStr.replace(/(.{4})/g, '$1 ').trim();
  }
}
