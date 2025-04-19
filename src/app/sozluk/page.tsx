"use client";
import React, { useEffect, useState, useRef, createContext } from "react";

const WORDS_PER_PAGE = 50;

function turkishSort(a: string, b: string) {
  return a.localeCompare(b, "tr");
}

function PartOfSpeech({ type }: { type?: string }) {
  if (!type) return null;
  return <span className="italic text-gray-600 text-xs ml-2">{type}</span>;
}

function Phonetic({ phonetic }: { phonetic?: string }) {
  if (!phonetic) return null;
  return <span className="text-gray-500 text-xs ml-2">/{phonetic}/</span>;
}

function Origin({ origin }: { origin?: string }) {
  if (!origin) return null;
  return <span className="text-xs text-gray-400 ml-2">({origin})</span>;
}

function replaceTasak(text: string): string {
  // Replace 'taşak' as a whole word, case-insensitive, Turkish locale
  return text.replace(/\btaşak\b/giu, "er bezi");
}

function cleanMeaningText(text: string): string {
  // Remove '► taşaklı' or ', taşaklı' or 'taşaklı' as a synonym/related word
  // Handles: '► taşaklı', '► foo, taşaklı', '► taşaklı, bar', etc.
  if (!text) return text;
  // Remove '► taşaklı' if it's the only one
  text = text.replace(/►\s*taşaklı\b[.,;]?/giu, "");
  // Remove ', taşaklı' or 'taşaklı,' in lists
  text = text.replace(/,\s*taşaklı\b/giu, "");
  text = text.replace(/taşaklı,\s*/giu, "");
  // Remove 'taşaklı' if it's alone after '►'
  text = text.replace(/►\s*,?\s*$/giu, "");
  // Remove 'taşaklı' if it's the only word
  if (text.trim().toLocaleLowerCase("tr") === "taşaklı") return "";
  return text;
}

function DictionaryEntry({ entry }: { entry: any }) {
  const { /* setSearchWord, setHighlightedWord, words */ } = React.useContext(DictionaryBookContext) || {};
  if (!entry) return null;
  let madde = entry.madde;
  madde = replaceTasak(madde);
  const phonetic = entry.telaffuz;
  const origin = entry.lisan;
  // Filter out any meaning whose text is exactly 'taşaklı' or '► taşaklı' (case-insensitive, Turkish locale)
  const meanings = (entry.anlamlarListe || [])
    .filter((anlam: any) => {
      const t = (typeof anlam.anlam === 'string' ? anlam.anlam : '').trim().toLocaleLowerCase('tr');
      return t !== 'taşaklı' && t !== '► taşaklı';
    })
    .map((anlam: any) => ({
      ...anlam,
      anlam: typeof anlam.anlam === 'string' ? cleanMeaningText(replaceTasak(anlam.anlam)) : anlam.anlam,
      orneklerListe: Array.isArray(anlam.orneklerListe)
        ? anlam.orneklerListe.map((o: any) => ({
            ...o,
            ornek: typeof o.ornek === 'string' ? replaceTasak(o.ornek) : o.ornek,
          }))
        : anlam.orneklerListe,
    }));
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-baseline gap-1 mb-1">
        <span className="font-bold tracking-wide text-black text-base sm:text-lg uppercase">{madde?.toLocaleUpperCase("tr")}</span>
        <Phonetic phonetic={phonetic} />
        <Origin origin={origin} />
      </div>
      <ol className="pl-4 list-decimal text-sm text-gray-800">
        {meanings.map((anlam: any, i: number) => {
          // Handle '343' Bakınız case
          if (typeof anlam.anlam === "string" && anlam.anlam.trim().startsWith("343")) {
            // Extract referenced word(s) after '343'
            const ref = anlam.anlam.replace(/^343\s*/i, "").trim();
            return (
              <li key={i} className="mb-1">
                <span className="italic text-gray-600">Bakınız:</span>{" "}
                <span className="text-gray-900">{ref}</span>
                <PartOfSpeech type={anlam.ozelliklerListe?.[0]?.tam_adi} />
              </li>
            );
          }
          return (
            <li key={i} className="mb-1">
              <span className="font-medium text-gray-900">
                {anlam.anlam}
              </span>
              <PartOfSpeech type={anlam.ozelliklerListe?.[0]?.tam_adi} />
              {/* Examples */}
              {anlam.orneklerListe && (
                <ul className="mt-1 space-y-1">
                  {anlam.orneklerListe.map((o: any, j: number) => (
                    <li key={j} className="pl-4 border-l-2 border-gray-300 italic text-gray-600 text-xs">
                      “{o.ornek}”
                      {o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi && (
                        <span className="ml-2 text-gray-400">— {o.yazar[0].tam_adi}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Context to allow DictionaryEntry to access setSearchWord, setHighlightedWord, words
const DictionaryBookContext = createContext<any>(null);

export default function DictionaryBook() {
  const [words, setWords] = useState<string[]>([]);
  const [page, setPage] = useState(0); // page = 0 is the first spread
  const [loading, setLoading] = useState(true);
  const [defs, setDefs] = useState<{ [word: string]: any | null }>({});
  const fetchingRef = useRef<{ [word: string]: boolean }>({});
  const [pageInput, setPageInput] = useState(1);
  const [searchWord, setSearchWord] = useState("");
  const [searchError, setSearchError] = useState("");
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://sozluk.gov.tr/autocomplete.json")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = data
            .map((d: any) => d.madde)
            .filter((w: string) => w.toLocaleLowerCase("tr") !== "taşaklı")
            .sort(turkishSort);
          setWords(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPageInput(page + 1);
  }, [page]);

  // Remove highlight after a short time
  useEffect(() => {
    if (highlightedWord) {
      const timeout = setTimeout(() => setHighlightedWord(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedWord]);

  // Fetch explanations for current spread
  useEffect(() => {
    const leftStart = page * WORDS_PER_PAGE * 2;
    const spreadWords = words.slice(leftStart, leftStart + WORDS_PER_PAGE * 2);
    spreadWords.forEach(word => {
      if (!word || defs[word] !== undefined || fetchingRef.current[word]) return;
      fetchingRef.current[word] = true;
      fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`)
        .then(res => res.json())
        .then((data) => {
          setDefs(prev => ({ ...prev, [word]: Array.isArray(data) && data.length > 0 ? data[0] : null }));
        })
        .finally(() => {
          fetchingRef.current[word] = false;
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, words]);

  const totalPages = Math.ceil(words.length / (WORDS_PER_PAGE * 2));
  const leftStart = page * WORDS_PER_PAGE * 2;
  const spreadWords = words.slice(leftStart, leftStart + WORDS_PER_PAGE * 2);
  // Distribute loaded entries as evenly as possible
  const loadedEntries = spreadWords.filter(w => defs[w] !== undefined);
  const loadingEntries = spreadWords.filter(w => defs[w] === undefined);
  const half = Math.ceil(loadedEntries.length / 2);
  const leftLoaded = loadedEntries.slice(0, half);
  const rightLoaded = loadedEntries.slice(half);
  // Fill up to 50 per page with loading placeholders if needed
  const leftWords = [...leftLoaded, ...loadingEntries.slice(0, WORDS_PER_PAGE - leftLoaded.length)];
  const rightWords = [...rightLoaded, ...loadingEntries.slice(WORDS_PER_PAGE - leftLoaded.length)];

  return (
    <DictionaryBookContext.Provider value={{ /* setSearchWord, setHighlightedWord, words */ }}>
      <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center py-8 px-2">
        {loading ? (
          <div className="text-lg text-gray-500 py-20">Yükleniyor...</div>
        ) : (
          <div className="w-full max-w-6xl flex flex-col items-center">
            <div className="relative flex flex-col sm:flex-row gap-0 w-full justify-center">
              {/* Left Page */}
              <div className="bg-white shadow-lg border border-gray-300 rounded-l-lg flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden font-serif text-sm leading-relaxed flex flex-col">
                <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-[#e2d6c2] to-transparent" />
                <div className="space-y-4 flex-1">
                  {leftWords.map((w, i) =>
                    defs[w] === undefined ? (
                      <div key={i} className="animate-pulse h-8 bg-gray-100 rounded w-3/4 mb-2" />
                    ) : defs[w] === null ? (
                      <div key={i} className="text-gray-400 italic mb-2">{w}</div>
                    ) : (
                      <div
                        key={i}
                        id={"sozluk-word-" + w}
                        className={highlightedWord === w ? "ring-2 ring-yellow-400 rounded" : ""}
                      >
                        <DictionaryEntry entry={defs[w]} />
                      </div>
                    )
                  )}
                </div>
                <div className="absolute bottom-2 left-6 text-xs text-gray-400 font-serif select-none">{page * 2 + 1}</div>
              </div>
              {/* Gutter */}
              <div className="hidden sm:flex flex-col items-center justify-center w-6 relative">
                <div className="h-5/6 w-0.5 bg-gray-200 rounded-full" />
              </div>
              {/* Right Page (hide on mobile) */}
              <div className="hidden sm:flex bg-white shadow-lg border border-gray-300 rounded-r-lg flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden font-serif text-sm leading-relaxed flex-col">
                <div className="space-y-4 flex-1">
                  {rightWords.map((w, i) =>
                    defs[w] === undefined ? (
                      <div key={i} className="animate-pulse h-8 bg-gray-100 rounded w-3/4 mb-2" />
                    ) : defs[w] === null ? (
                      <div key={i} className="text-gray-400 italic mb-2">{w}</div>
                    ) : (
                      <DictionaryEntry key={i} entry={defs[w]} />
                    )
                  )}
                </div>
                <div className="absolute bottom-2 right-6 text-xs text-gray-400 font-serif select-none">{page * 2 + 2}</div>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex gap-4 mt-8 items-center">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Önceki
              </button>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!searchWord.trim()) return;
                  setSearchError("");
                  // Find word index (case-insensitive, Turkish locale)
                  const searchVal = searchWord.trim().toLocaleLowerCase("tr");
                  if (searchVal === "taşaklı") {
                    setSearchError("Kelime bulunamadı");
                    return;
                  }
                  const idx = words.findIndex(w => w.toLocaleLowerCase("tr") === searchVal);
                  if (idx === -1) {
                    setSearchError("Kelime bulunamadı");
                    return;
                  }
                  const newPage = Math.floor(idx / (WORDS_PER_PAGE * 2));
                  setPage(newPage);
                  setPageInput(newPage + 1);
                  setHighlightedWord(words[idx]);
                  setTimeout(() => {
                    const el = document.getElementById("sozluk-word-" + words[idx]);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 300);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-center font-serif text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                >
                  Ara
                </button>
              </form>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                onClick={() => {
                  setPage(p => {
                    const next = Math.min(totalPages - 1, p + 1);
                    // Only scroll to top on mobile (sm: hidden right page)
                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 100);
                    }
                    return next;
                  });
                }}
                disabled={page >= totalPages - 1}
              >
                Sonraki →
              </button>
            </div>
          </div>
        )}
      </div>
    </DictionaryBookContext.Provider>
  );
} 