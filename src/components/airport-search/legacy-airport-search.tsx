import React from 'react';

interface AirportSearchProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  placeholder?: string;
}

export function LegacyAirportSearch({ value, onChange, label, placeholder }: AirportSearchProps) {
  return (
    <div>
      <label>{label}</label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
} 