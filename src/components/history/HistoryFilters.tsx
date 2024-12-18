import React from 'react';

type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';

interface HistoryFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export default function HistoryFilters({ currentFilter, onFilterChange }: HistoryFiltersProps) {
  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentFilter === value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}