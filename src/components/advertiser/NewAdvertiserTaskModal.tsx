import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CategorySelect from './CategorySelect';
import CountrySelect from './CountrySelect';
import TaskSteps from './TaskSteps';
import ProofRequirementsList from './ProofRequirementsList';
import MetadataService, { type Category } from '../../services/metadata';
import AdvertiserService from '../../services/advertiser';
import toast from 'react-hot-toast';
import DebugPanel from '../DebugPanel';
import { formatCurrency } from '../../utils/currency';

interface NewAdvertiserTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: any) => void;
}

interface ProofRequirement {
  type: 'screenshot' | 'text' | 'url';
  description: string;
}

export default function NewAdvertiserTaskModal({
  onClose,
  onTaskCreated,
}: NewAdvertiserTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [minReward, setMinReward] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    total_budget: '',
    time_estimate: '',
    category: '',
    time_in_seconds: '',
    steps: [''],
    approval_hours: '0',
    allowed_countries: [] as string[],
    total_submission_limit: '0',
    daily_submission_limit: '0',
    cooldown_timer: '0',
    is_active: true,
    proof_requirements: [] as ProofRequirement[],
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await MetadataService.getMetadata();
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        toast.error('Failed to load category data');
      }
    };
    fetchMetadata();
  }, []);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      category: category.slug,
      time_in_seconds: category.min_duration.toString(),
      time_estimate: `${Math.ceil(category.min_duration / 60)} minutes`,
      proof_requirements:
        category.slug === 'other-categories'
          ? prev.proof_requirements
          : category.proof_types.map((type) => ({
              type: type as 'screenshot' | 'text' | 'url',
              description: `Provide ${type} proof`,
            })),
    }));

    // Update minimum reward based on category and selected countries
    const minReward = MetadataService.calculateMinReward(
      formData.allowed_countries,
      category
    );
    setMinReward(minReward);
  };

  const handleTimeInSecondsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const seconds = parseInt(e.target.value);
    if (!isNaN(seconds)) {
      const minutes = Math.ceil(seconds / 60);
      setFormData((prev) => ({
        ...prev,
        time_in_seconds: e.target.value,
        time_estimate: `${minutes} minute${minutes !== 1 ? 's' : ''}`,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCountryChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      allowed_countries: selected,
    }));

    // Update minimum reward based on selected countries and category
    if (selectedCategory) {
      const minReward = MetadataService.calculateMinReward(
        selected,
        selectedCategory
      );
      setMinReward(minReward);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        reward: parseFloat(formData.reward),
        total_budget: parseFloat(formData.total_budget),
        time_estimate: formData.time_estimate,
        category: formData.category,
        time_in_seconds: parseInt(formData.time_in_seconds),
        steps: formData.steps.filter((step) => step.trim() !== ''),
        approval_hours: parseInt(formData.approval_hours),
        allowed_countries: formData.allowed_countries,
        total_submission_limit: parseInt(formData.total_submission_limit),
        daily_submission_limit: parseInt(formData.daily_submission_limit),
        cooldown_timer: parseInt(formData.cooldown_timer),
        is_active: formData.is_active,
        proof_requirements: formData.proof_requirements,
      };

      setDebugInfo({
        request: {
          method: 'POST',
          url: '/advertiser/tasks',
          data: taskData,
        },
      });

      const newTask = await AdvertiserService.createTask(taskData);

      setDebugInfo((prev) => ({
        ...prev,
        response: {
          status: 200,
          data: newTask,
        },
      }));

      toast.success('Campaign created successfully');
      onTaskCreated(newTask);
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);

      setDebugInfo((prev) => ({
        ...prev,
        response: {
          status: error.response?.status || 500,
          error: error.message,
          data: error.response?.data,
        },
      }));

      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!metadata) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <CategorySelect
            categories={metadata.categories}
            selectedCategory={formData.category}
            onChange={handleCategoryChange}
          />

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reward per Task (
                {minReward > 0 ? `Min: ${formatCurrency(minReward)}` : ''})
              </label>
              <input
                type="number"
                name="reward"
                required
                min={minReward}
                step="0.01"
                value={formData.reward}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Budget
              </label>
              <input
                type="number"
                name="total_budget"
                required
                min="0"
                step="0.01"
                value={formData.total_budget}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {selectedCategory?.slug === 'other-categories' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time in Seconds
                </label>
                <input
                  type="number"
                  name="time_in_seconds"
                  required
                  min="1"
                  value={formData.time_in_seconds}
                  onChange={handleTimeInSecondsChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Estimated time: {formData.time_estimate}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Approval Time
              </label>
              <select
                name="approval_hours"
                value={formData.approval_hours}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="0">Instant</option>
                <option value="3">3 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Submission Limit
              </label>
              <input
                type="number"
                name="daily_submission_limit"
                min="0"
                value={formData.daily_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Submission Limit
              </label>
              <input
                type="number"
                name="total_submission_limit"
                min="0"
                value={formData.total_submission_limit}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cooldown Timer (hours)
              </label>
              <input
                type="number"
                name="cooldown_timer"
                min="0"
                value={formData.cooldown_timer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <CountrySelect
            countries={metadata.countries}
            selectedCountries={formData.allowed_countries}
            onChange={handleCountryChange}
          />

          <TaskSteps
            steps={formData.steps}
            onChange={(steps) => setFormData((prev) => ({ ...prev, steps }))}
          />

          <ProofRequirementsList
            requirements={formData.proof_requirements}
            onUpdate={(requirements) =>
              setFormData((prev) => ({
                ...prev,
                proof_requirements: requirements,
              }))
            }
            isCustomCategory={selectedCategory?.slug === 'other-categories'}
          />

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
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
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
