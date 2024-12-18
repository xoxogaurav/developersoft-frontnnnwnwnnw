import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface DisputeResolutionFormProps {
  onCancel: () => void;
  onResolve: (resolution: 'user' | 'advertiser', feedback: string) => void;
}

export default function DisputeResolutionForm({ onCancel, onResolve }: DisputeResolutionFormProps) {
  const [feedback, setFeedback] = useState('');

  const handleResolve = (resolution: 'user' | 'advertiser') => {
    if (!feedback.trim()) {
      alert('Please provide feedback before resolving the dispute');
      return;
    }
    onResolve(resolution, feedback);
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Resolution Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Provide detailed feedback about your decision..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => handleResolve('advertiser')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <XCircle className="h-4 w-4 inline-block mr-1" />
          Resolve for Advertiser
        </button>
        <button
          onClick={() => handleResolve('user')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 inline-block mr-1" />
          Resolve for User
        </button>
      </div>
    </div>
  );
}