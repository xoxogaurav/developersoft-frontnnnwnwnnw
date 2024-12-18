import React from 'react';
import type { PaymentMethod } from '../../services/withdrawals';

interface PaymentDetailsFormProps {
  method: PaymentMethod;
  formFields: Record<string, string>;
  formErrors: Record<string, string | undefined>;
  onFieldChange: (field: string, value: string) => void;
}

export default function PaymentDetailsForm({ 
  method, 
  formFields, 
  formErrors, 
  onFieldChange 
}: PaymentDetailsFormProps) {
  return (
    <div className="space-y-4">
      {method.required_fields.map(field => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            {field.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </label>
          <input
            type="text"
            value={formFields[field] || ''}
            onChange={(e) => onFieldChange(field, e.target.value)}
            className={`mt-1 block w-full rounded-md ${
              formErrors[field]
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
          {formErrors[field] && (
            <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>
          )}
        </div>
      ))}
    </div>
  );
}