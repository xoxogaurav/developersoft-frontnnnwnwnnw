import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import DebugPanel from './DebugPanel';

interface DisputeModalProps {
  submissionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisputeModal({ submissionId, onClose, onSuccess }: DisputeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    evidence: ''
  });
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }

    setIsSubmitting(true);

    try {
      setDebugInfo({
        request: {
          method: 'POST',
          url: `https://bookmaster.fun/api/disputes/transactions/${submissionId}/dispute`,
          data: formData
        }
      });

      await api.post(`https://bookmaster.fun/api/disputes/transactions/${submissionId}/dispute`, formData);

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: { success: true }
        }
      }));

      toast.success('Dispute submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Dispute</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for Dispute
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Explain why you believe the rejection was incorrect..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Evidence
            </label>
            <textarea
              name="evidence"
              value={formData.evidence}
              onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Provide any additional proof or evidence to support your dispute..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Information
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Only submit a dispute if you're certain you met all requirements</li>
                    <li>Provide clear and specific evidence to support your case</li>
                    <li>False disputes may result in account penalties</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>

        <DebugPanel
          request={debugInfo?.request}
          response={debugInfo?.response}
        />
      </div>
    </div>
  );
}