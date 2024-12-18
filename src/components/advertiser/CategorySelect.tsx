import React from 'react';
import type { Category } from '../../services/metadata';

interface CategorySelectProps {
  categories: Category[];
  selectedCategory: string;
  onChange: (category: Category) => void;
}

export default function CategorySelect({ categories, selectedCategory, onChange }: CategorySelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        value={selectedCategory}
        onChange={(e) => {
          const category = categories.find(c => c.slug === e.target.value);
          if (category) {
            onChange(category);
          }
        }}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      {selectedCategory && (
        <p className="mt-1 text-sm text-gray-500">
          {categories.find(c => c.slug === selectedCategory)?.description}
        </p>
      )}
    </div>
  );
}