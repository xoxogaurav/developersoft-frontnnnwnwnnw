import React from 'react';
import { Plus } from 'lucide-react';
import ProofRequirementInput from './ProofRequirementInput';

interface ProofRequirement {
  type: 'screenshot' | 'text' | 'url';
  description: string;
}

interface ProofRequirementsListProps {
  requirements: ProofRequirement[];
  onUpdate: (requirements: ProofRequirement[]) => void;
  isCustomCategory?: boolean;
}

export default function ProofRequirementsList({
  requirements,
  onUpdate,
  isCustomCategory = false,
}: ProofRequirementsListProps) {
  const handleUpdate = (index: number, field: keyof ProofRequirement, value: string) => {
    const updatedRequirements = requirements.map((req, i) =>
      i === index ? { ...req, [field]: value } : req
    );
    onUpdate(updatedRequirements);
  };

  const handleRemove = (index: number) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    onUpdate(updatedRequirements);
  };

  const handleAdd = () => {
    onUpdate([...requirements, { type: 'screenshot', description: '' }]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Proof Requirements
      </label>
      
      {requirements.map((req, index) => (
        <ProofRequirementInput
          key={index}
          requirement={req}
          index={index}
          onUpdate={handleUpdate}
          onRemove={isCustomCategory ? handleRemove : undefined}
          allowTypeChange={isCustomCategory}
        />
      ))}

      {isCustomCategory && (
        <button
          type="button"
          onClick={handleAdd}
          className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Proof Requirement
        </button>
      )}
    </div>
  );
}