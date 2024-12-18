import React, { useState } from 'react';
import { X } from 'lucide-react';
import AdvertiserService from '../../services/advertiser';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';
import type { AdvertiserTask } from '../../services/advertiser';

interface EditAdvertiserTaskModalProps {
  task: AdvertiserTask;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function EditAdvertiserTaskModal({
  task,
  onClose,
  onTaskUpdated,
}: EditAdvertiserTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    cooldown_timer: task.cooldown_timer?.toString() || '0',
    total_submission_limit: task.total_submission_limit?.toString() || '0',
    daily_submission_limit: task.daily_submission_limit?.toString() || '0',
    is_active: task.is_active !== false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.id) {
      toast.error('Invalid task ID');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        cooldown_timer: parseInt(formData.cooldown_timer),
        total_submission_limit: parseInt(formData.total_submission_limit),
        daily_submission_limit: parseInt(formData.daily_submission_limit),
        is_active: formData.is_active
      };

      setDebugInfo({
        request: {
          method: 'PUT',
          url: `/advertiser/tasks/${task.id}`,
          data: taskData
        }
      });

      const updatedTask = await AdvertiserService.updateTask(task.id, taskData);

      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: 200,
          data: updatedTask
        }
      }));

      toast.success('Campaign updated successfully');
      onTaskUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data
        }
      }));

      toast.error(error.message || 'Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Campaign Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cooldown Timer (hours)</label>
            <input
              type="number"
              name="cooldown_timer"
              min="0"
              value={formData.cooldown_timer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum time between submissions from the same user
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Submission Limit</label>
            <input
              type="number"
              name="total_submission_limit"
              min="0"
              value={formData.total_submission_limit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum total submissions allowed (0 for unlimited)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Submission Limit</label>
            <input
              type="number"
              name="daily_submission_limit"
              min="0"
              value={formData.daily_submission_limit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum submissions allowed per day (0 for unlimited)
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Campaign Active
            </label>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {debugInfo && (
          <DebugPanel
            request={debugInfo.request}
            response={debugInfo.response}
          />
        )}
      </div>
    </div>
  );
}