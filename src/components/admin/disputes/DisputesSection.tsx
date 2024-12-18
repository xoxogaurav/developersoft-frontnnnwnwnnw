import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import DisputeList from './DisputeList';
import DisputeService from '../../../services/disputes';
import toast from 'react-hot-toast';
import DebugPanel from '../../DebugPanel';

export default function DisputesSection() {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchDisputes = async () => {
    try {
      setDebugInfo({
        request: {
          method: 'GET',
          url: 'https://bookmaster.fun/api/disputes/admin/disputes'
        }
      });

      const data = await DisputeService.getDisputes();
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data
        }
      }));

      setDisputes(data);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (disputeId: number, resolution: 'user' | 'advertiser', feedback: string) => {
    try {
      setDebugInfo({
        request: {
          method: 'POST',
          url: `https://bookmaster.fun/api/disputes/admin/disputes/${disputeId}/resolve`,
          data: { resolution, feedback }
        }
      });

      await DisputeService.resolveDispute(disputeId, { resolution, feedback });

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success('Dispute resolved successfully');
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error('Failed to resolve dispute');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Dispute Resolution Guidelines
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Review all provided evidence thoroughly</li>
                <li>Check original task requirements and submission proofs</li>
                <li>Provide clear feedback explaining your decision</li>
                <li>Be fair and consistent in your judgments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <DisputeList
        disputes={disputes}
        onResolveDispute={handleResolveDispute}
      />

      <DebugPanel
        request={debugInfo?.request}
        response={debugInfo?.response}
      />
    </div>
  );
}