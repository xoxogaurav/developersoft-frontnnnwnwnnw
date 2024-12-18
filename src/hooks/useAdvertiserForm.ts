import { useState, useEffect } from 'react';
import MetadataService from '../services/metadata';
import type { Category } from '../services/metadata';

interface ProofRequirement {
  type: 'screenshot' | 'text' | 'url';
  description: string;
}

interface FormData {
  title: string;
  description: string;
  reward: string;
  total_budget: string;
  time_estimate: string;
  category: string;
  time_in_seconds: string;
  steps: string[];
  approval_hours: string;
  allowed_countries: string[];
  total_submission_limit: string;
  daily_submission_limit: string;
  cooldown_timer: string;
  is_active: boolean;
  proof_requirements: ProofRequirement[];
}

interface UseAdvertiserFormProps {
  initialData?: Partial<FormData>;
}

export function useAdvertiserForm({ initialData = {} }: UseAdvertiserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    reward: '',
    total_budget: '',
    time_estimate: '',
    category: '',
    time_in_seconds: '',
    steps: [''],
    approval_hours: '0',
    allowed_countries: [],
    total_submission_limit: '0',
    daily_submission_limit: '0',
    cooldown_timer: '0',
    is_active: true,
    proof_requirements: [],
    ...initialData
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [minReward, setMinReward] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTimeInSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(e.target.value);
    if (!isNaN(seconds)) {
      const minutes = Math.ceil(seconds / 60);
      setFormData(prev => ({
        ...prev,
        time_in_seconds: e.target.value,
        time_estimate: `${minutes} minute${minutes !== 1 ? 's' : ''}`
      }));
    }
  };

  const handleCountryChange = (selected: string[]) => {
    setFormData(prev => ({
      ...prev,
      allowed_countries: selected
    }));

    // Update minimum reward based on selected countries and category
    if (selectedCategory) {
      const minReward = MetadataService.calculateMinReward(selected, selectedCategory);
      setMinReward(minReward);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleTimeInSecondsChange,
    handleCountryChange,
    minReward,
    selectedCategory,
    setSelectedCategory
  };
}