import api from './api';

interface DisputeResolution {
  resolution: 'user' | 'advertiser';
  feedback: string;
}

class DisputeService {
  private static instance: DisputeService;

  private constructor() {}

  public static getInstance(): DisputeService {
    if (!DisputeService.instance) {
      DisputeService.instance = new DisputeService();
    }
    return DisputeService.instance;
  }

  public async getDisputes() {
    try {
      const response = await api.get('https://bookmaster.fun/api/disputes/admin/disputes');
      return response.data.parsed?.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch disputes');
    }
  }

  public async resolveDispute(disputeId: number, resolution: DisputeResolution) {
    try {
      const response = await api.post(
        `https://bookmaster.fun/api/disputes/admin/disputes/${disputeId}/resolve`,
        resolution
      );
      return response.data.parsed?.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resolve dispute');
    }
  }
}

export default DisputeService.getInstance();