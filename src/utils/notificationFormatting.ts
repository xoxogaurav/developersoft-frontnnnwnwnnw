import { formatCurrency } from './currency';

interface NotificationContent {
  title: string;
  message: string;
  timestamp: Date;
  amount?: string | number;
}

export const formatNotificationMessage = (message: string): NotificationContent => {
  // Default values
  let title = 'Notification';
  let amount: string | number | undefined;
  let timestamp = new Date();

  // Task completion patterns
  const completionPattern = /Your submission for "(.*?)" has been automatically approved! \$([\d.]+) has been added to your balance\./;
  const approvalPattern = /Your submission for "(.*?)" has been approved! \$([\d.]+) has been added to your balance\./;
  const pendingPattern = /Your submission for "(.*?)" is pending review\./;
  const paymentPattern = /Your payment of \$([\d.]+) has been processed successfully\. Your new advertiser balance is \$([\d.]+)\./;

  if (message.match(paymentPattern)) {
    const matches = message.match(paymentPattern);
    if (matches) {
      title = 'Payment Processed';
      amount = parseFloat(matches[1]);
      message = `Your payment of ${formatCurrency(amount)} has been processed successfully. Your new advertiser balance is ${formatCurrency(matches[2])}.`;
    }
  } else if (message.includes('automatically approved')) {
    const matches = message.match(completionPattern);
    if (matches) {
      title = 'Task Completed';
      amount = parseFloat(matches[2]);
      message = `Your submission for "${matches[1]}" has been automatically approved! ${formatCurrency(amount)} has been added to your balance.`;
    }
  } else if (message.includes('has been approved')) {
    const matches = message.match(approvalPattern);
    if (matches) {
      title = 'Task Approved';
      amount = parseFloat(matches[2]);
      message = `Your submission for "${matches[1]}" has been approved! ${formatCurrency(amount)} has been added to your balance.`;
    }
  } else if (message.includes('pending review')) {
    const matches = message.match(pendingPattern);
    if (matches) {
      title = 'Task Submitted';
      message = `Your submission for "${matches[1]}" is pending review. We'll notify you once it's approved.`;
    }
  }

  return {
    title,
    message,
    timestamp,
    amount
  };
};

export const formatNotificationDate = (dateString: string): string => {
  try {
    // Handle ISO 8601 date string with timezone offset
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    // Format the date using Intl.DateTimeFormat for better localization
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return formatter.format(date);
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString);
    return 'Date unavailable';
  }
};