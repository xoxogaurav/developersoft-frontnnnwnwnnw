import React from 'react';
import { AlertCircle } from 'lucide-react';

interface IdVerificationWarningProps {
  onGoToSettings: () => void;
}

export default function IdVerificationWarning({ onGoToSettings }: IdVerificationWarningProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            ID Verification Required
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              You must verify your government ID before making withdrawals.
            </p>
            <button
              onClick={onGoToSettings}
              className="mt-2 text-red-800 underline hover:text-red-900"
            >
              Go to Settings to Verify ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}