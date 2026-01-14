"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchBox from "@/components/SearchBox";
import { useAutocomplete } from "@/hooks/useAutocomplete";

interface SearchPanelProps {
  initialValue?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export default function SearchPanel({
  initialValue = "",
  autoFocus = false,
  compact = false,
}: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const { suggestions, loading } = useAutocomplete(query);

  const handleSearch = (word: string) => {
    if (!word.trim()) return;
    router.push(`/ara/${encodeURIComponent(word.trim())}`);
  };

  return (
    <div className={compact ? "w-full max-w-xl" : "w-full max-w-2xl lg:max-w-4xl"}>
      <SearchBox
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
        suggestions={suggestions}
        onSuggestionClick={setQuery}
        autoFocus={autoFocus}
        placeholder="Kelime, deyim veya atasözü ara..."
      />
    </div>
  );
}
