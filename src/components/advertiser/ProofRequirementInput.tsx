import React from 'react';
import { Trash } from 'lucide-react';

interface ProofRequirement {
  type: 'screenshot' | 'text' | 'url';
  description: string;
}

interface ProofRequirementInputProps {
  requirement: ProofRequirement;
  index: number;
  onUpdate: (index: number, field: keyof ProofRequirement, value: string) => void;
  onRemove?: (index: number) => void;
  allowTypeChange?: boolean;
}

export default function ProofRequirementInput({
  requirement,
  index,
  onUpdate,
  onRemove,
  allowTypeChange = false,
}: ProofRequirementInputProps) {
  return (
    <div className="flex gap-2 mb-2">
      {allowTypeChange ? (
        <select
          value={requirement.type}
          onChange={(e) => onUpdate(index, 'type', e.target.value as 'screenshot' | 'text' | 'url')}
          className="w-32 rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="screenshot">Screenshot</option>
          <option value="text">Text</option>
          <option value="url">URL</option>
        </select>
      ) : (
        <div className="w-32 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md">
          {requirement.type.charAt(0).toUpperCase() + requirement.type.slice(1)}
        </div>
      )}
      
      <input
        type="text"
        value={requirement.description}
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        placeholder={`Description for ${requirement.type} proof`}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
      />
      
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="px-3 py-2 text-red-600 hover:text-red-700"
        >
          <Trash className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}