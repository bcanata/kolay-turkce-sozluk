"use client";

import React, { useId, useRef, useState } from "react";

interface SearchBoxProps {
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch: (word: string) => void;
  suggestions: string[];
  onSuggestionClick?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  loading,
  value,
  onChange,
  onSearch,
  suggestions,
  onSuggestionClick,
  placeholder = "Türkçe bir kelime ara...",
  autoFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const activeId = activeIndex >= 0 ? `${listId}-item-${activeIndex}` : undefined;

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSearch(value.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onSuggestionClick?.(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSuggestionSelect(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form
        className="flex gap-2"
        autoComplete="off"
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 px-4 py-2 rounded border border-amber-200 bg-white/90 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-amber-700 dark:bg-gray-900 dark:text-white"
          type="text"
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={e => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          aria-busy={loading}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
        />
        <button
          className="px-4 py-2 bg-amber-600 text-white rounded shadow-sm hover:bg-amber-700 disabled:opacity-50"
          type="submit"
          disabled={!value.trim()}
        >
          Ara
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-lg border border-amber-100 bg-white/95 shadow-lg backdrop-blur dark:border-amber-800 dark:bg-gray-950"
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              id={`${listId}-item-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`px-4 py-2 text-sm cursor-pointer ${i === activeIndex ? "bg-amber-100 text-amber-900 dark:bg-amber-800/60 dark:text-amber-50" : "hover:bg-amber-50 dark:hover:bg-amber-900/40"}`}
              onMouseDown={() => {
                handleSuggestionSelect(s);
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
