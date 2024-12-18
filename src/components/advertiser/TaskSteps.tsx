import React from 'react';
import { Plus, Trash } from 'lucide-react';

interface TaskStepsProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export default function TaskSteps({ steps, onChange }: TaskStepsProps) {
  const handleAddStep = () => {
    onChange([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    onChange(steps.map((step, i) => i === index ? value : step));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Task Steps
      </label>
      {steps.map((step, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={step}
            onChange={(e) => handleStepChange(index, e.target.value)}
            placeholder={`Step ${index + 1}`}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
          {steps.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveStep(index)}
              className="px-3 py-2 text-red-600 hover:text-red-700"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddStep}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Step
      </button>
    </div>
  );
}