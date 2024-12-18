import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import WithdrawalService from '../../services/withdrawals';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services';
import toast from 'react-hot-toast';
import PaymentMethodList from './PaymentMethodList';
import AmountInput from './AmountInput';
import PaymentDetailsForm from './PaymentDetailsForm';
import WithdrawalSummary from './WithdrawalSummary';
import IdVerificationWarning from './IdVerificationWarning';
import type { PaymentMethod } from '../../services/withdrawals';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

interface WithdrawPageProps {
  onBack: () => void;
  availableBalance: number;
}

export default function WithdrawPage({
  onBack,
  availableBalance,
}: WithdrawPageProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methods, profileData] = await Promise.all([
          WithdrawalService.getWithdrawalMethods(),
          UserService.getProfile(),
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

  const validateField = (field: string, value: string): string | undefined => {
    if (!selectedMethod) return;

    const validation = selectedMethod.field_validations[field];
    if (!validation) return;

    if (validation.min_length && value.length < validation.min_length) {
      return `Minimum length is ${validation.min_length} characters`;
    }

    if (validation.max_length && value.length > validation.max_length) {
      return `Maximum length is ${validation.max_length} characters`;
    }

    if (validation.regex) {
      const regex = new RegExp(validation.regex.slice(1, -1));
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }
  };

  const validateAmount = (value: string): string | undefined => {
    if (!selectedMethod) return;

    var numericAmount;

    if (getCurrencySymbol() == '$') {
      numericAmount = parseFloat(value);
    } else {
      numericAmount = parseFloat(value) / 84;
    }

    if (isNaN(numericAmount)) return 'Please enter a valid amount';

    const minAmount = parseFloat(selectedMethod.min_amount.toString());
    if (numericAmount < minAmount) {
      return `Minimum withdrawal amount is ${formatCurrency(minAmount)}`;
    }

    if (selectedMethod.max_amount !== null) {
      const maxAmount = parseFloat(selectedMethod.max_amount.toString());
      if (numericAmount > maxAmount) {
        return `Maximum withdrawal amount is ${formatCurrency(maxAmount)}`;
      }
    }

    if (numericAmount > availableBalance) {
      return 'Insufficient balance';
    }

    return undefined;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const error = validateAmount(value);
    if (error) {
      setFormErrors((prev) => ({ ...prev, amount: error }));
    } else {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  };

  const calculateFees = () => {
    if (!selectedMethod || !amount) return 0;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 0;

    const fixedFee = parseFloat(selectedMethod.fee_fixed.toString());
    const percentageFee =
      (parseFloat(selectedMethod.fee_percentage.toString()) / 100) *
      numericAmount;

    return fixedFee + percentageFee;
  };

  const validateForm = (): boolean => {
    if (!selectedMethod || !amount) return false;

    const errors: Record<string, string> = {};

    // Validate amount
    const amountError = validateAmount(amount);
    if (amountError) {
      errors.amount = amountError;
    }

    // Validate required fields
    selectedMethod.required_fields.forEach((field) => {
      const value = formFields[field] || '';
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const withdrawalData = {
        method_code: selectedMethod.code,
        amount:
          getCurrencySymbol() == '$'
            ? parseFloat(amount)
            : parseFloat(amount) / 84,
        payment_details: formFields,
      };

      await WithdrawalService.createWithdrawal(withdrawalData);
      toast.success('Withdrawal request submitted successfully');
      onBack();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showIdVerificationWarning =
    !profile?.governmentIdStatus || profile.governmentIdStatus !== 'approved';

  const fees = calculateFees();
  const totalAmount = parseFloat(amount || '0') + fees;

  const hasErrors = Object.keys(formErrors).length > 0;
  const isFormComplete =
    selectedMethod &&
    amount &&
    selectedMethod.required_fields.every((field) => formFields[field]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to wallet
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="mt-1 text-gray-500">
              Choose your preferred withdrawal method
            </p>
          </div>

          {showIdVerificationWarning ? (
            <div className="p-6">
              <IdVerificationWarning
                onGoToSettings={() => {
                  window.location.href = '/settings';
                }}
              />
            </div>
          ) : (
            <div className="p-6 space-y-8">
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
                  onClick={onBack}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasErrors || !isFormComplete}
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
