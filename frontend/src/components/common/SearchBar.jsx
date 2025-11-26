import React from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/helpers';

/**
 * Reusable search bar component
 */
const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  debounceMs = 300,
  className = '',
  onClear 
}) => {
  const debouncedOnChange = debounce((value) => {
    onChange(value);
  }, debounceMs);

  const handleChange = (e) => {
    const value = e.target.value;
    debouncedOnChange(value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      // Trigger onChange with empty value
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        placeholder={placeholder}
      />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;