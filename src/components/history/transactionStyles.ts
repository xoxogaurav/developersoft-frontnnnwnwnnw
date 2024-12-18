export interface TransactionStyle {
  bg: string;
  text: string;
  prefix: string;
}

export function getTransactionStyles(type: string, status: string): TransactionStyle {
  if (type === 'withdrawal') {
    return {
      bg: 'bg-blue-100',
      text: status === 'completed' ? 'text-gray-900' : 'text-gray-600',
      prefix: '-',
    };
  }

  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-100',
        text: 'text-gray-900',
        prefix: '+',
      };
    case 'pending':
      return {
        bg: 'bg-yellow-100',
        text: 'text-gray-600',
        prefix: '+',
      };
    case 'failed':
      return {
        bg: 'bg-red-100',
        text: 'text-red-600 line-through',
        prefix: '+',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        prefix: '',
      };
  }
}