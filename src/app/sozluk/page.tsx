"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cleanMeaningText, replaceOffensiveTerms } from "@/lib/tdkText";
import type { Anlam, Ornek } from "@/lib/tdk";

const WORDS_PER_PAGE = 50;

function turkishSort(a: string, b: string) {
  return a.localeCompare(b, "tr");
}

function PartOfSpeech({ type }: { type?: string }) {
  if (!type) return null;
  return <span className="italic text-gray-600 dark:text-gray-400 text-xs ml-2">{type}</span>;
}

function Phonetic({ phonetic }: { phonetic?: string }) {
  if (!phonetic) return null;
  return <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">/{phonetic}/</span>;
}

function Origin({ origin }: { origin?: string }) {
  if (!origin) return null;
  return <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({origin})</span>;
}

interface DictionaryEntryData {
  madde: string;
  telaffuz?: string;
  lisan?: string;
  anlamlarListe: Anlam[];
}

function DictionaryEntry({ entry }: { entry: DictionaryEntryData | null }) {
  if (!entry) return null;
  let madde = entry.madde;
  madde = replaceOffensiveTerms(madde);
  const phonetic = entry.telaffuz;
  const origin = entry.lisan;
  // Filter out any meaning whose text is exactly 'taşaklı' or '► taşaklı' (case-insensitive, Turkish locale)
  const meanings = (entry.anlamlarListe || [])
    .filter((anlam: Anlam) => {
      const t = (typeof anlam.anlam === 'string' ? anlam.anlam : '').trim().toLocaleLowerCase('tr');
      return t !== 'taşaklı' && t !== '► taşaklı';
    })
    .map((anlam: Anlam) => ({
      ...anlam,
      anlam:
        typeof anlam.anlam === "string"
          ? cleanMeaningText(replaceOffensiveTerms(anlam.anlam))
          : anlam.anlam,
      orneklerListe: Array.isArray(anlam.orneklerListe)
        ? anlam.orneklerListe.map((o: Ornek) => ({
            ...o,
            ornek: typeof o.ornek === "string" ? replaceOffensiveTerms(o.ornek) : o.ornek,
          }))
        : anlam.orneklerListe,
    }));
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-baseline gap-1 mb-1">
        <span className="font-bold tracking-wide text-gray-900 dark:text-amber-100 text-base sm:text-lg uppercase">{madde?.toLocaleUpperCase("tr")}</span>
        <Phonetic phonetic={phonetic} />
        <Origin origin={origin} />
      </div>
      <ol className="pl-4 list-decimal text-sm text-gray-800 dark:text-gray-200">
        {meanings.map((anlam: Anlam, i: number) => {
          // Handle '343' Bakınız case
          if (typeof anlam.anlam === "string" && anlam.anlam.trim().startsWith("343")) {
            // Extract referenced word(s) after '343'
            const ref = anlam.anlam.replace(/^343\s*/i, "").trim();
            return (
              <li key={i} className="mb-1">
                <span className="italic text-gray-600 dark:text-gray-400">Bakınız:</span>{" "}
                <span className="text-gray-900 dark:text-gray-100">{ref}</span>
                <PartOfSpeech type={anlam.ozelliklerListe?.[0]?.tam_adi} />
              </li>
            );
          }
          return (
            <li key={i} className="mb-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {anlam.anlam}
              </span>
              <PartOfSpeech type={anlam.ozelliklerListe?.[0]?.tam_adi} />
              {/* Examples */}
              {anlam.orneklerListe && (
                <ul className="mt-1 space-y-1">
                  {anlam.orneklerListe.map((o: Ornek, j: number) => (
                    <li key={j} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 italic text-gray-600 dark:text-gray-400 text-xs">
                      &quot;{o.ornek}&quot;
                      {o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi && (
                        <span className="ml-2 text-gray-400 dark:text-gray-500">— {o.yazar[0].tam_adi}</span>
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

export default function DictionaryBook() {
  const [words, setWords] = useState<string[]>([]);
  const [page, setPage] = useState(0); // page = 0 is the first spread
  const [loading, setLoading] = useState(true);
  const [defs, setDefs] = useState<{ [word: string]: DictionaryEntryData | null }>({});
  const fetchingRef = useRef<{ [word: string]: boolean }>({});
  const [searchWord, setSearchWord] = useState("");
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const defsRef = useRef(defs);

  useEffect(() => {
    defsRef.current = defs;
  }, [defs]);

  useEffect(() => {
    fetch("https://sozluk.gov.tr/autocomplete.json")
      .then(res => res.json())
      .then((data: { madde: string }[]) => {
        if (Array.isArray(data)) {
          const sorted = data
            .map((d) => d.madde)
            .filter((w: string) => w.toLocaleLowerCase("tr") !== "taşaklı")
            .sort(turkishSort);
          setWords(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
    spreadWords.forEach((word) => {
      if (!word || defsRef.current[word] !== undefined || fetchingRef.current[word]) return;
      fetchingRef.current[word] = true;
      fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`)
        .then((res) => res.json())
        .then((data: DictionaryEntryData[]) => {
          setDefs((prev) => ({
            ...prev,
            [word]: Array.isArray(data) && data.length > 0 ? data[0] : null,
          }));
        })
        .finally(() => {
          fetchingRef.current[word] = false;
        });
    });
  }, [page, words]);

  const totalPages = Math.ceil(words.length / (WORDS_PER_PAGE * 2));
  const leftStart = page * WORDS_PER_PAGE * 2;
  const spreadWords = useMemo(
    () => words.slice(leftStart, leftStart + WORDS_PER_PAGE * 2),
    [leftStart, words]
  );
  const loadedEntries = spreadWords.filter((w) => defs[w] !== undefined);
  const loadingEntries = spreadWords.filter((w) => defs[w] === undefined);
  const half = Math.ceil(loadedEntries.length / 2);
  const leftLoaded = loadedEntries.slice(0, half);
  const rightLoaded = loadedEntries.slice(half);
  const leftWords = [...leftLoaded, ...loadingEntries.slice(0, WORDS_PER_PAGE - leftLoaded.length)];
  const rightWords = [...rightLoaded, ...loadingEntries.slice(WORDS_PER_PAGE - leftLoaded.length)];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-10">
      <div className="w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-900/80 dark:text-amber-200"
          aria-label="Ana sayfa"
        >
          ← Ana sayfa
        </Link>
      </div>
      {loading ? (
        <div className="text-lg text-gray-500 dark:text-gray-400 py-20">Yükleniyor...</div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="relative flex flex-col sm:flex-row gap-0 w-full justify-center">
            <div className="bg-white/90 shadow-lg border border-amber-200 rounded-l-2xl flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden font-serif text-sm leading-relaxed flex flex-col dark:border-amber-900 dark:bg-gray-950/70">
              <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-amber-200 to-transparent dark:from-amber-900" />
              <div className="space-y-4 flex-1">
                {leftWords.map((w, i) =>
                  defs[w] === undefined ? (
                    <div key={i} className="animate-pulse h-8 bg-amber-50 dark:bg-amber-900/30 rounded w-3/4 mb-2" />
                  ) : defs[w] === null ? (
                    <div key={i} className="text-gray-400 dark:text-gray-600 italic mb-2">{w}</div>
                  ) : (
                    <div
                      key={i}
                      id={"sozluk-word-" + w}
                      className={highlightedWord === w ? "ring-2 ring-amber-400 rounded" : ""}
                    >
                      <DictionaryEntry entry={defs[w]} />
                    </div>
                  )
                )}
              </div>
              <div className="absolute bottom-2 left-6 text-xs text-gray-400 dark:text-gray-600 font-serif select-none">
                {page * 2 + 1}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center w-6 relative">
              <div className="h-5/6 w-0.5 bg-amber-100 rounded-full dark:bg-amber-900" />
            </div>
            <div className="hidden sm:flex bg-white/90 shadow-lg border border-amber-200 rounded-r-2xl flex-1 min-w-[220px] max-w-xl px-6 py-8 relative overflow-hidden font-serif text-sm leading-relaxed flex-col dark:border-amber-900 dark:bg-gray-950/70">
              <div className="space-y-4 flex-1">
                {rightWords.map((w, i) =>
                  defs[w] === undefined ? (
                    <div key={i} className="animate-pulse h-8 bg-amber-50 rounded w-3/4 mb-2 dark:bg-amber-900/30" />
                  ) : defs[w] === null ? (
                    <div key={i} className="text-gray-400 dark:text-gray-600 italic mb-2">{w}</div>
                  ) : (
                    <DictionaryEntry key={i} entry={defs[w]} />
                  )
                )}
              </div>
              <div className="absolute bottom-2 right-6 text-xs text-gray-400 dark:text-gray-600 font-serif select-none">
                {page * 2 + 2}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8 items-center justify-center">
            <button
              className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-800"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Önceki
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchWord.trim()) return;
                const searchVal = searchWord.trim().toLocaleLowerCase("tr");
                if (searchVal === "taşaklı") {
                  return;
                }
                const idx = words.findIndex((w) => w.toLocaleLowerCase("tr") === searchVal);
                if (idx === -1) {
                  return;
                }
                const newPage = Math.floor(idx / (WORDS_PER_PAGE * 2));
                setPage(newPage);
                setHighlightedWord(words[idx]);
                setTimeout(() => {
                  const el = document.getElementById("sozluk-word-" + words[idx]);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className="flex items-center gap-2"
            >
              <label className="sr-only" htmlFor="sozluk-search">
                Sözlük içinde ara
              </label>
              <input
                id="sozluk-search"
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Kelime bul"
                className="w-40 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-center font-serif text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-amber-700 dark:bg-gray-900 dark:text-amber-100"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700"
              >
                Ara
              </button>
            </form>
            <button
              className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-800"
              onClick={() => {
                setPage((p) => {
                  const next = Math.min(totalPages - 1, p + 1);
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
  );
}
