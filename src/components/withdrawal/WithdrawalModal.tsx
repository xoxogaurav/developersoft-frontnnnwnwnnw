import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import WithdrawalService from '../../services/withdrawals';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';
import PaymentMethodList from './PaymentMethodList';
import AmountInput from './AmountInput';
import PaymentDetailsForm from './PaymentDetailsForm';
import WithdrawalSummary from './WithdrawalSummary';
import IdVerificationWarning from './IdVerificationWarning';
import type { PaymentMethod } from '../../services/withdrawals';
import { formatCurrency } from '../../utils/currency';

interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number;
}

interface FormErrors {
  amount?: string;
  [key: string]: string | undefined;
}

export default function WithdrawalModal({
  onClose,
  onSuccess,
  availableBalance,
}: WithdrawalModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methods, profileData] = await Promise.all([
          WithdrawalService.getWithdrawalMethods(),
          UserService.getProfile()
        ]);
        setPaymentMethods(methods);
        setSelectedMethod(methods[0]);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load withdrawal methods');
      }
    };
    fetchData();
  }, []);

  // ... (keep the validation functions)

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    // Validate all fields
    const errors: FormErrors = {};
    errors.amount = validateAmount(amount);

    selectedMethod.required_fields.forEach(field => {
      const value = formFields[field] || '';
      errors[field] = validateField(field, value);
    });

    if (Object.values(errors).some(error => error !== undefined)) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const withdrawalData = {
        amount: parseFloat(amount),
        payment_method: selectedMethod.code,
        payment_details: formFields
      };

      await WithdrawalService.createWithdrawal(withdrawalData);
      toast.success('Withdrawal request submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showIdVerificationWarning =
    !profile?.governmentIdStatus || profile.governmentIdStatus !== 'approved';

  const fees = calculateFees();
  const totalAmount = parseFloat(amount || '0') + fees;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Withdraw Funds
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {showIdVerificationWarning ? (
          <div className="p-6">
            <IdVerificationWarning
              onGoToSettings={() => {
                onClose();
                window.location.href = '/settings';
              }}
            />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Available Balance
              </label>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(availableBalance.toFixed(2))}
              </div>
            </div>

            <PaymentMethodList
              methods={paymentMethods}
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <AmountInput
                value={amount}
                onChange={handleAmountChange}
                error={formErrors.amount}
              />

              {selectedMethod && (
                <PaymentDetailsForm
                  method={selectedMethod}
                  formFields={formFields}
                  formErrors={formErrors}
                  onFieldChange={handleFieldChange}
                />
              )}
            </div>

            {selectedMethod && amount && !formErrors.amount && (
              <WithdrawalSummary
                amount={amount}
                fees={fees}
                totalAmount={totalAmount}
                processingTime={selectedMethod.processing_time}
              />
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <DebugPanel
            request={debugInfo?.request}
            response={debugInfo?.response}
          />
        </div>
      </div>
    </div>
  );
}