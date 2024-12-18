import api from './api';

export interface WithdrawalRequest {
  amount: number;
  payment_method: string;
  payment_details: Record<string, string>;
}

export interface PaymentMethod {
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

export interface Withdrawal {
  id: number;
  amount: string | number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  payment_details: Record<string, string>;
  created_at: string;
  processed_at: string | null;
}

class WithdrawalService {
  private static instance: WithdrawalService;

  private constructor() {}

  public static getInstance(): WithdrawalService {
    if (!WithdrawalService.instance) {
      WithdrawalService.instance = new WithdrawalService();
    }
    return WithdrawalService.instance;
  }

  public async getWithdrawalMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('https://bookmaster.fun/api/withdrawals/methods');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Failed to fetch withdrawal methods');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.parsed?.error?.message || 
        error.message || 
        'Failed to fetch withdrawal methods'
      );
    }
  }

  public async createWithdrawal(data: WithdrawalRequest): Promise<Withdrawal> {
    try {
      const response = await api.post('/withdrawals', data);
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error(response.data.parsed?.error?.message || 'Failed to create withdrawal');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      if (error.response?.data?.parsed?.error?.code === 'VALIDATION_ERROR') {
        const validationErrors = error.response.data.parsed.error.message;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      }
      
      throw new Error(
        error.response?.data?.parsed?.error?.message || 
        error.message || 
        'Failed to create withdrawal'
      );
    }
  }

  public async getWithdrawals(): Promise<Withdrawal[]> {
    try {
      const response = await api.get('/withdrawals');
      
      if (!response.data.parsed?.success || !response.data.parsed?.data) {
        throw new Error('Failed to fetch withdrawals');
      }

      return response.data.parsed.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.parsed?.error?.message || 
        error.message || 
        'Failed to fetch withdrawals'
      );
    }
  }
}

export default WithdrawalService.getInstance();