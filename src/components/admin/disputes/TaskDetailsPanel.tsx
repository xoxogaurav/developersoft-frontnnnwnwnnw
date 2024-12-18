import React from 'react';
import { Clock, Tag, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

interface ProofRequirement {
  type: string;
  description: string;
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
  proof_requirements: ProofRequirement[];
  approval_hours: number;
  is_active: boolean;
}

interface TaskDetailsPanelProps {
  task: Task;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function TaskDetailsPanel({ task, isExpanded, onToggle }: TaskDetailsPanelProps) {
  const reward = typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-sm font-medium text-gray-700">Task Details</h4>
        <span className="text-sm text-indigo-600">
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700">Description:</h5>
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700">Reward:</h5>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(reward)}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700">Time Estimate:</h5>
              <p className="mt-1 text-sm text-gray-900">{task.time_estimate}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700">Category:</h5>
              <p className="mt-1 text-sm text-gray-900">{task.category}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700">Difficulty:</h5>
              <p className="mt-1 text-sm text-gray-900">{task.difficulty}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700">Approval Time:</h5>
              <p className="mt-1 text-sm text-gray-900">
                {task.approval_hours === 0 ? 'Instant' : `${task.approval_hours} hours`}
              </p>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700">Required Steps:</h5>
            <ol className="mt-1 space-y-1 list-decimal list-inside">
              {task.steps.map((step, index) => (
                <li key={index} className="text-sm text-gray-600">{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700">Required Proofs:</h5>
            <ul className="mt-1 space-y-2">
              {task.proof_requirements.map((req, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="inline-block w-20 font-medium">
                    {req.type.charAt(0).toUpperCase() + req.type.slice(1)}:
                  </span>
                  <span>{req.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}