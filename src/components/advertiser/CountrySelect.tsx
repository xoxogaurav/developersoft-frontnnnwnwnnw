import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Country } from '../../services/metadata';
import { formatCurrency } from '../../utils/currency';

interface CountrySelectProps {
  countries: {
    tier1: Country[];
    tier2: Country[];
    tier3: Country[];
  };
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
}

export default function CountrySelect({
  countries,
  selectedCountries,
  onChange,
}: CountrySelectProps) {
  // Combine all countries into a single array
  const allCountries = [
    ...countries.tier1.map((c) => ({ ...c, tier: '1 - Premium' })),
    ...countries.tier2.map((c) => ({ ...c, tier: '2 - Standard' })),
    ...countries.tier3.map((c) => ({ ...c, tier: '3 - Basic' })),
  ];

  const handleSelect = (code: string) => {
    if (!selectedCountries.includes(code)) {
      onChange([...selectedCountries, code]);
    }
  };

  const handleDeselect = (code: string) => {
    onChange(selectedCountries.filter((c) => c !== code));
  };

  const getCountryDetails = (code: string) => {
    return allCountries.find((c) => c.code === code);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Target Countries
      </label>
      <div className="flex gap-4">
        {/* Available Countries */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Available Countries
          </h3>
          <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
            {allCountries
              .filter((country) => !selectedCountries.includes(country.code))
              .map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div>
                    <span className="font-medium">{country.name}</span>
                    <span className="text-gray-500 ml-2">
                      (Min: {formatCurrency(country.min_reward)})
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Tier {country.tier}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
          </div>
        </div>

        {/* Selected Countries */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Countries
          </h3>
          <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
            {selectedCountries.map((code) => {
              const country = getCountryDetails(code);
              if (!country) return null;

              return (
                <button
                  key={code}
                  onClick={() => handleDeselect(code)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between group"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 text-right">
                    <span className="font-medium">{country.name}</span>
                    <span className="text-gray-500 ml-2">
                      (Min: {formatCurrency(country.min_reward)})
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Tier {country.tier}
                    </span>
                  </div>
                </button>
              );
            })}
            {selectedCountries.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No countries selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
