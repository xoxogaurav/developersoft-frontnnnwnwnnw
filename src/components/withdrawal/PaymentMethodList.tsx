import React from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import type { PaymentMethod } from '../../services/withdrawals';

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodList({ methods, selectedMethod, onMethodSelect }: PaymentMethodListProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Method
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map(method => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={selectedMethod?.id === method.id}
            onSelect={() => onMethodSelect(method)}
          />
        ))}
      </div>
    </div>
  );
}