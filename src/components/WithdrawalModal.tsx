import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle, IndianRupee } from 'lucide-react';
import WithdrawalService from '../services/withdrawals';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  description: string;
  min_amount: string | number;
  max_amount: string | number | null;
  fee_fixed: string | number;
  fee_percentage: string | number;
  processing_time: number;
  required_fields: string[];
  field_validations: Record<string, {
    regex?: string;
    min_length?: number;
    max_length?: number;
  }>;
  icon_url: string;
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
        // Fetch payment methods
        const methods = await WithdrawalService.getWithdrawalMethods();
        setPaymentMethods(methods);
        setSelectedMethod(methods[0]);

        // Fetch user profile
        const profileData = await UserService.getProfile();
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
      const regex = new RegExp(validation.regex.slice(1, -1)); // Remove leading/trailing slashes
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }
  };

  const validateAmount = (value: string): string | undefined => {
    if (!selectedMethod) return;

    const numericAmount = parseFloat(value);
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
    setFormFields(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const error = validateAmount(value);
    setFormErrors(prev => ({ ...prev, amount: error }));
  };

  const calculateFees = () => {
    if (!selectedMethod || !amount) return 0;
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 0;

    const fixedFee = parseFloat(selectedMethod.fee_fixed.toString());
    const percentageFee = (parseFloat(selectedMethod.fee_percentage.toString()) / 100) * numericAmount;
    
    return fixedFee + percentageFee;
  };

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

      setDebugInfo({
        request: {
          method: 'POST',
          url: '/withdrawals',
          data: withdrawalData
        }
      });

      await WithdrawalService.createWithdrawal(withdrawalData);

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success('Withdrawal request submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show ID verification warning if not verified
  const showIdVerificationWarning =
    !profile?.governmentIdStatus || profile.governmentIdStatus !== 'approved';

  const fees = calculateFees();
  const totalAmount = parseFloat(amount || '0') + fees;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
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
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ID Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      You must verify your government ID before making
                      withdrawals.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = '/settings';
                      }}
                      className="mt-2 text-red-800 underline hover:text-red-900"
                    >
                      Go to Settings to Verify ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`flex items-center p-3 border rounded-lg ${
                      selectedMethod?.id === method.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={method.icon_url}
                      alt={method.name}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="ml-3 text-left">
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
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
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-2 border rounded-md ${
                    formErrors.amount
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
              )}
            </div>

            {/* Payment Details Fields */}
            {selectedMethod && (
              <div className="space-y-4">
                {selectedMethod.required_fields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </label>
                    <input
                      type="text"
                      value={formFields[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
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
            )}

            {/* Fee and Total Calculation */}
            {selectedMethod && amount && !formErrors.amount && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee</span>
                  <span className="text-gray-900">{formatCurrency(fees.toFixed(2))}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(totalAmount.toFixed(2))}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Processing time: {selectedMethod.processing_time} hours
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </div>
          </div>
        )}

        {/* Debug Panel */}
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