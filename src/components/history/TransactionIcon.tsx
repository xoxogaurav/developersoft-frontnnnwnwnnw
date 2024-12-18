import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowDownRight } from 'lucide-react';

interface TransactionIconProps {
  type: string;
  status: string;
  className?: string;
}

export default function TransactionIcon({ type, status, className = '' }: TransactionIconProps) {
  if (type === 'withdrawal') {
    return <ArrowDownRight className={`${className} text-blue-600`} />;
  }

  switch (status) {
    case 'completed':
      return <CheckCircle className={`${className} text-green-600`} />;
    case 'pending':
      return <Clock className={`${className} text-yellow-600`} />;
    case 'failed':
      return <XCircle className={`${className} text-red-600`} />;
    default:
      return <Clock className={`${className} text-gray-600`} />;
  }
}