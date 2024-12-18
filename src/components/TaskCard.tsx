import {
  Clock,
  DollarSign,
  Tag,
  Zap,
  UserCheck,
  IndianRupee,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  reward: string | number;
  timeEstimate: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  approval_type?: string;
  approvalType?: 'automatic' | 'manual';
  onClick: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  reward,
  timeEstimate,
  category,
  difficulty,
  approval_type,
  approvalType,
  onClick,
}: TaskCardProps) {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  }[difficulty];

  // Normalize approval type from API response
  const normalizedApprovalType = approval_type || approvalType;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md cursor-pointer hover:border-indigo-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="flex items-center text-lg font-bold text-indigo-600">
          {formatCurrency(reward)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {timeEstimate}
        </span>
        <span className="flex items-center text-sm text-gray-500">
          <Tag className="h-4 w-4 mr-1" />
          {category}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}
        >
          {difficulty}
        </span>
        <span
          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            normalizedApprovalType === 'automatic'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {normalizedApprovalType === 'automatic' ? (
            <>
              <Zap className="h-3 w-3 mr-1" /> Instant
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3 mr-1" /> Manual
            </>
          )}
        </span>
      </div>
    </div>
  );
}
