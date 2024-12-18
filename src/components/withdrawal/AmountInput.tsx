import React from 'react';
import { DollarSign, IndianRupee } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function AmountInput({ value, onChange, error }: AmountInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Amount to Withdraw
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getCurrencySymbol() === '$' ? (
            <DollarSign className="h-5 w-5 text-gray-400" />
          ) : (
            <IndianRupee className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full pl-10 pr-12 py-2 border rounded-md ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          placeholder="0.00"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}