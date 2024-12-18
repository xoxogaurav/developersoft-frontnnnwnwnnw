import React from 'react';
import type { PaymentMethod } from '../../services/withdrawals';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PaymentMethodCard({ method, isSelected, onSelect }: PaymentMethodCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center p-3 border rounded-lg transition-colors w-full ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <img
        src={method.icon_url}
        alt={method.name}
        className="w-8 h-8 object-contain flex-shrink-0"
      />
      <div className="ml-3 text-left flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{method.name}</div>
        <div className="text-sm text-gray-500 truncate">{method.description}</div>
      </div>
    </button>
  );
}