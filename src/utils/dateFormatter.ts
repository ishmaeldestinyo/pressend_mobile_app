import { format } from 'date-fns';

export function formatDateWithOrdinalAndTime(dateString: string | Date) {
  const date = new Date(dateString);

  // Get day with ordinal suffix
  const day = date.getDate();
  const ordinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  const dayWithOrdinal = `${day}${ordinal(day)}`;

  // Format weekday, month, year
  const formattedDate = format(date, 'EEE, MMM yyyy'); // e.g. Wed, May 2025

  // Format time in 12-hour format with am/pm
  const formattedTime = format(date, 'h:mm a'); // e.g. 1:03 PM

  return `${dayWithOrdinal} ${formattedDate} at ${formattedTime.toLowerCase()}`;
}
