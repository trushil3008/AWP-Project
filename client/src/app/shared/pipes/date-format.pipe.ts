import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value, format = 'medium') {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const options = this.getFormatOptions(format);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  private getFormatOptions(format) {
    const formats = {
      short: {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      },
      medium: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      },
      long: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      },
      full: {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      },
      time: {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      },
      datetime: {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
    };

    return formats[format] || formats.medium;
  }
}
