import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface WithdrawalSummaryProps {
  amount: string;
  fees: number;
  totalAmount: number;
  processingTime: number;
}

export default function WithdrawalSummary({
  amount,
  fees,
  totalAmount,
  processingTime,
}: WithdrawalSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Amount</span>
        <span className="text-gray-900">{amount}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Fee</span>
        <span className="text-gray-900">{fees.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
        <span className="text-gray-900">Total</span>
        <span className="text-gray-900">{totalAmount.toFixed(2)}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Processing time: {processingTime} hours
      </p>
    </div>
  );
}
