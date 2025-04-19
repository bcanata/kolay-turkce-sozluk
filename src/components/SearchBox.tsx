import React, { useState, useRef } from "react";

interface SearchBoxProps {
  onSearch: (word: string) => void;
  loading: boolean;
  input: string;
  setInput: (v: string) => void;
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, loading, input, setInput, suggestions, onSuggestionClick }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative w-full max-w-md mx-auto">
      <form
        className="flex gap-2"
        autoComplete="off"
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) onSearch(input.trim());
          setShowSuggestions(false);
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
          type="text"
          placeholder="Türkçe bir kelime ara..."
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          disabled={loading}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          Ara
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow mt-1 max-h-56 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 text-sm"
              onMouseDown={() => {
                onSuggestionClick(s);
                setShowSuggestions(false);
                inputRef.current?.blur();
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox; 