"use client";
import React, { useEffect, useState } from "react";

const WORDS_PER_PAGE = 50;

function turkishSort(a: string, b: string) {
  return a.localeCompare(b, "tr");
}

export default function DictionaryBook() {
  const [words, setWords] = useState<string[]>([]);
  const [page, setPage] = useState(0); // page = 0 is the first spread
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://sozluk.gov.tr/autocomplete.json")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = data.map((d: { madde: string }) => d.madde).sort(turkishSort);
          setWords(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(words.length / (WORDS_PER_PAGE * 2));
  const leftStart = page * WORDS_PER_PAGE * 2;
  const leftWords = words.slice(leftStart, leftStart + WORDS_PER_PAGE);
  const rightWords = words.slice(leftStart + WORDS_PER_PAGE, leftStart + WORDS_PER_PAGE * 2);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center py-8 px-2">
      {loading ? (
        <div className="text-lg text-gray-500 py-20">Yükleniyor...</div>
      ) : (
        <div className="w-full max-w-6xl flex flex-col items-center">
          <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
            {/* Left Page */}
            <div className="bg-white shadow-lg border border-gray-300 rounded-lg flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-[#e2d6c2] to-transparent" />
              <div className="font-serif text-lg font-semibold mb-2 text-gray-700">Sayfa {page * 2 + 1}</div>
              <ul className="font-serif text-base text-gray-800 space-y-1">
                {leftWords.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            {/* Right Page (hide on mobile) */}
            <div className="hidden sm:block bg-white shadow-lg border border-gray-300 rounded-lg flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-l from-[#e2d6c2] to-transparent" />
              <div className="font-serif text-lg font-semibold mb-2 text-gray-700 text-right">Sayfa {page * 2 + 2}</div>
              <ul className="font-serif text-base text-gray-800 space-y-1">
                {rightWords.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Önceki
            </button>
            <span className="font-serif text-lg text-gray-600">{page + 1} / {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 