import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, ExternalLink, FileText, Image } from 'lucide-react';
import { formatDate } from '../../history/dateFormatter';
import TaskDetailsPanel from './TaskDetailsPanel';
import { formatCurrency } from '../../../utils/currency';

interface Proof {
  type: string;
  url?: string;
  content?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  reward: string | number;
  time_estimate: string;
  category: string;
  difficulty: string;
  steps: string[];
  proof_requirements: Array<{
    type: string;
    description: string;
  }>;
  approval_hours: number;
  is_active: boolean;
}

interface Submission {
  id: number;
  task_id: number;
  user_id: number;
  status: string;
  proofs: Proof[];
  task: Task;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Dispute {
  id: number;
  task_submission_id: number;
  user_id: number;
  reason: string;
  evidence: string;
  status: 'pending' | 'resolved' | 'rejected';
  admin_feedback: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  submission: Submission;
  user: User;
}

interface DisputeListProps {
  disputes: Dispute[];
  onResolveDispute: (disputeId: number, status: 'user' | 'advertiser', feedback: string) => void;
}

export default function DisputeList({ disputes, onResolveDispute }: DisputeListProps) {
  const [selectedDispute, setSelectedDispute] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleResolve = (disputeId: number, status: 'user' | 'advertiser') => {
    if (!feedback.trim()) {
      alert('Please provide feedback before resolving the dispute');
      return;
    }
    onResolveDispute(disputeId, status, feedback);
    setSelectedDispute(null);
    setFeedback('');
  };

  if (!disputes.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No disputes found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {disputes.map((dispute) => (
        <div key={dispute.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {dispute.submission.task.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Submitted by: {dispute.user.name} ({dispute.user.email})
              </p>
              <p className="text-sm text-gray-500">
                Submitted at: {formatDate(dispute.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(dispute.submission.task.reward)}
              </div>
            </div>
          </div>

          {/* Dispute Details */}
          <div className="space-y-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Dispute Reason:</h4>
              <p className="mt-1 text-sm text-gray-600">{dispute.reason}</p>
            </div>

            {dispute.evidence && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Additional Evidence:</h4>
                <p className="mt-1 text-sm text-gray-600">{dispute.evidence}</p>
              </div>
            )}

            {/* Task Details */}
            <TaskDetailsPanel
              task={dispute.submission.task}
              isExpanded={expandedTask === dispute.submission.task_id}
              onToggle={() => setExpandedTask(
                expandedTask === dispute.submission.task_id ? null : dispute.submission.task_id
              )}
            />

            {/* Submission Proofs */}
            <div>
              <h4 className="text-sm font-medium text-gray-700">Submission Proofs:</h4>
              <div className="mt-2 space-y-2">
                {dispute.submission.proofs.map((proof, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {proof.type === 'screenshot' && proof.url && (
                      <div className="flex-1">
                        <button
                          onClick={() => setSelectedImage(proof.url)}
                          className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <Image className="h-4 w-4 mr-1" />
                          View Screenshot
                        </button>
                        <img
                          src={proof.url}
                          alt="Submission proof"
                          className="mt-2 w-full h-48 object-cover rounded-lg cursor-pointer"
                          onClick={() => setSelectedImage(proof.url)}
                        />
                      </div>
                    )}
                    {proof.type === 'text' && proof.content && (
                      <div className="flex-1">
                        <div className="flex items-center text-sm text-gray-700 mb-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Text Proof
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {proof.content}
                        </p>
                      </div>
                    )}
                    {proof.type === 'url' && proof.url && (
                      <div className="flex-1">
                        <a
                          href={proof.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {proof.url}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution Controls */}
          {dispute.status === 'pending' && selectedDispute === dispute.id && (
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
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolve(dispute.id, 'advertiser')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 inline-block mr-1" />
                  Reject Dispute
                </button>
                <button
                  onClick={() => handleResolve(dispute.id, 'user')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 inline-block mr-1" />
                  Approve Dispute
                </button>
              </div>
            </div>
          )}

          {dispute.status === 'pending' && selectedDispute !== dispute.id && (
            <div className="mt-4">
              <button
                onClick={() => setSelectedDispute(dispute.id)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Resolve Dispute
              </button>
            </div>
          )}

          {dispute.admin_feedback && (
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700">Admin Feedback:</h4>
              <p className="mt-1 text-sm text-gray-600">{dispute.admin_feedback}</p>
            </div>
          )}
        </div>
      ))}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full mx-4">
            <img
              src={selectedImage}
              alt="Proof preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}