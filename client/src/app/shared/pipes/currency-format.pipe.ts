import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value, currencyCode = 'INR', showSymbol = true) {
    if (value === null || value === undefined) {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let formatted = formatter.format(Math.abs(numValue));

    if (!showSymbol) {
      formatted = formatted.replace(/[^0-9.,]/g, '').trim();
    }

    // Add negative sign if needed
    if (numValue < 0) {
      formatted = '-' + formatted;
    }

    return formatted;
  }
}
