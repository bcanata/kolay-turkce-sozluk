"use client";
import React, { useState, useRef, useEffect } from "react";
import DefinitionCard from "../components/DefinitionCard";
import SearchBox from "../components/SearchBox";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";

// TypeScript interfaces for API responses
interface YazimResult {
  sozu: string;
}

interface Ornek {
  ornek: string;
  yazar?: { tam_adi: string }[];
}

interface Anlam {
  anlam: string;
  ozelliklerListe?: { tam_adi: string }[];
  orneklerListe?: Ornek[];
}

interface AnlamResult {
  madde: string;
  telaffuz?: string;
  lisan?: string;
  anlamlarListe?: Anlam[];
  birlesikler?: string;
  atasozu?: { madde: string }[];
}

interface ProverbResult {
  madde: string;
  anlamlarListe?: Anlam[];
}

interface Results {
  yazim: YazimResult[];
  anlam: AnlamResult[];
}

// Circumflex mapping cache
const circumflexMap: Record<string, string> = {};
let circumflexLoaded = false;
async function loadCircumflexMap() {
  if (circumflexLoaded) return;
  try {
    const res = await fetch("https://sozluk.gov.tr/assets/js/autocompleteSapka.json");
    const data = await res.json();
    Object.assign(circumflexMap, data);
    circumflexLoaded = true;
  } catch {}
}
function getCircumflex(word: string) {
  if (!word) return word;
  const lower = word.toLocaleLowerCase("tr");
  return circumflexMap[lower] || word;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-100 text-red-700 border border-red-300 rounded p-4 my-4 w-full max-w-md mx-auto text-center">
      {message}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [results] = useState<Results | null>(null);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [proverbs] = useState<ProverbResult[]>([]);
  const [autocompleteList, setAutocompleteList] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Theme state and logic
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const cookie = document.cookie.match(/(?:^|; )theme=([^;]*)/);
      if (cookie) return cookie[1] === "dark" ? "dark" : "light";
      // Fallback to browser
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Apply theme to <html> and save cookie
  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  // Fetch circumflex map on mount
  React.useEffect(() => {
    loadCircumflexMap();
  }, []);

  // Fetch autocomplete list on mount
  React.useEffect(() => {
    fetch("https://sozluk.gov.tr/autocomplete.json")
      .then(res => res.json())
      .then((data: { madde: string }[]) => {
        if (Array.isArray(data)) {
          setAutocompleteList(data.map((d) => d.madde));
        }
      })
      .catch(() => setAutocompleteList([]));
  }, []);

  // Filter suggestions locally as user types
  React.useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = input.trim().toLocaleLowerCase("tr");
      const filtered = autocompleteList.filter(word =>
        word.toLocaleLowerCase("tr").startsWith(q)
      ).slice(0, 20); // limit to 20 suggestions
      setSuggestions(filtered);
    }, 100);
  }, [input, autocompleteList]);

  const handleSearch = (word: string) => {
    if (!word.trim()) return;
    router.push(`/ara/${encodeURIComponent(word.trim())}`);
  };

  const handleBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const last = newHistory.pop();
      if (last) {
        handleSearch(last);
      }
      return newHistory;
    });
  };

  const handleSuggestionClick = (s: string) => {
    setInput(s);
    handleSearch(s);
  };

  // SEO helpers
  const searched = input.trim();
  const pageTitle = searched ? `Kolay Türkçe Sözlük – ${searched}` : "Kolay Türkçe Sözlük";
  const description = searched
    ? `${searched} kelimesinin anlamı, kökeni, örnekleri ve daha fazlası. Kolay Türkçe Sözlük ile hızlı ve güvenilir Türkçe sözlük deneyimi.`
    : "Kolay Türkçe Sözlük: Hızlı, güvenilir ve modern Türkçe sözlük. Kelime anlamları, kökenleri, örnekler ve daha fazlası.";
  const canonicalUrl = typeof window !== "undefined"
    ? window.location.href
    : "https://kolayturkcesozluk.com/";

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="next-size-adjust" content="" />
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Kolay Türkçe Sözlük" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="theme-color" content="#2563eb" />
      </Head>
      {/* Theme toggle button */}
      <button
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-100 dark:bg-gray-800 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        aria-label="Tema değiştir"
        onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
        type="button"
      >
        {theme === "dark" ? (
          // Sun icon
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12h2.25m12.02 6.02l1.59 1.59m-13.44-13.44l1.59 1.59m0 9.86l-1.59 1.59m13.44-13.44l-1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
          </svg>
        ) : (
          // Moon icon
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 dark:text-gray-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </button>
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center" itemProp="name">Kolay Türkçe Sözlük</h1>
        <div className="w-full max-w-2xl lg:max-w-4xl flex items-center mb-8">
          <SearchBox
            onSearch={handleSearch}
            loading={loading}
            input={input}
            setInput={setInput}
            suggestions={suggestions.map(s => {
              const cfx = getCircumflex(s);
              return cfx !== s ? `${s} → ${cfx}` : s;
            })}
            onSuggestionClick={handleSuggestionClick}
          />
          {history.length > 0 && (
            <button
              className="ml-2 px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              onClick={handleBack}
              type="button"
              aria-label="Geri"
            >
              ← Geri
            </button>
          )}
        </div>
        {loading && <Spinner />}
        {error && <ErrorBox message={error} />}
        {/* Proverbs & Phrases search results */}
        {(() => {
          // Collect all main result maddes
          const mainMaddes = new Set(
            (results?.anlam || []).map((entry: AnlamResult) => entry.madde?.toLowerCase().trim())
          );
          const filteredProverbs = proverbs.filter((entry: ProverbResult) => !mainMaddes.has(entry.madde?.toLowerCase().trim()));
          if (filteredProverbs.length === 0) return null;
          const proverbGridCols = filteredProverbs.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2";
          const proverbMaxW = filteredProverbs.length === 1 ? "max-w-3xl" : "max-w-4xl";
          return (
            <div className={`w-full ${proverbMaxW} mt-8 space-y-6`}>
              <div>
                <h2 className="text-xl font-semibold mb-2">Atasözleri ve Deyimler</h2>
                <div className={`grid ${proverbGridCols} gap-6`}>
                  {filteredProverbs.map((entry: ProverbResult, i: number) => (
                    <div key={i} className="p-4 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 h-full flex flex-col">
                      <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-lg font-bold text-purple-800 dark:text-purple-200">{entry.madde}</span>
                      </div>
                      <div className="space-y-4 flex-1">
                        {(() => {
                          let lastType: string | undefined = undefined;
                          return entry.anlamlarListe?.map((anlam: Anlam) => {
                            let type: string | undefined = undefined;
                            if (anlam.ozelliklerListe && Array.isArray(anlam.ozelliklerListe)) {
                              type = anlam.ozelliklerListe.map((oz: { tam_adi: string }) => oz.tam_adi).join(", ");
                              lastType = type;
                            } else {
                              type = lastType;
                            }
                            return (
                              <DefinitionCard
                                key={anlam.anlam}
                                definition={anlam.anlam}
                                examples={anlam.orneklerListe?.map((o: Ornek) =>
                                  o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi
                                    ? `${o.ornek} — ${o.yazar[0].tam_adi}`
                                    : o.ornek
                                )}
                                type={type}
                                onReferenceClick={handleSearch}
                              />
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {/* Results placeholder */}
        {results && (() => {
          const anlamCount = results.anlam?.length || 0;
          const gridCols = anlamCount === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2";
          const maxW = anlamCount === 1 ? "max-w-3xl" : "max-w-4xl";
          // Show both forms if available
          const searched = input.trim();
          const cfx = getCircumflex(searched);
          const plain = Object.keys(circumflexMap).find(k => circumflexMap[k] === searched);
          const showBoth = cfx !== searched || plain;
          return (
            <div className={`w-full ${maxW} mt-8 space-y-6`}>
              {showBoth && (
                <div className="mb-2 flex gap-4 items-center">
                  <span className="text-lg font-bold text-blue-700">{searched}</span>
                  {cfx !== searched && <span className="text-lg font-bold text-blue-700">{cfx}</span>}
                  {plain && <span className="text-lg font-bold text-blue-700">{plain}</span>}
                </div>
              )}
              {/* Yazım kontrolü sonuçları */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Yazım Kontrolü</h2>
                {Array.isArray(results.yazim) && results.yazim.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {results.yazim.map((item: YazimResult, i: number) => (
                      <span
                        key={i}
                        className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded dark:bg-green-900 dark:text-green-200"
                      >
                        {item.sozu}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Sonuç bulunamadı.</span>
                )}
              </div>
              {/* Anlamlar */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Anlamlar</h2>
                {Array.isArray(results.anlam) && results.anlam.length > 0 ? (
                  <div className={`grid ${gridCols} gap-6`}>
                    {results.anlam.map((entry: AnlamResult, i: number) => (
                      <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full flex flex-col">
                        <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                          <span className="text-lg font-bold">{entry.madde}</span>
                          {entry.telaffuz && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">/ {entry.telaffuz} /</span>
                          )}
                          {entry.lisan && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 ml-2 dark:bg-yellow-900 dark:text-yellow-200">{entry.lisan}</span>
                          )}
                        </div>
                        <div className="space-y-4 flex-1">
                          {(() => {
                            let lastType: string | undefined = undefined;
                            return entry.anlamlarListe?.map((anlam: Anlam) => {
                              let type: string | undefined = undefined;
                              if (anlam.ozelliklerListe && Array.isArray(anlam.ozelliklerListe)) {
                                type = anlam.ozelliklerListe.map((oz: { tam_adi: string }) => oz.tam_adi).join(", ");
                                lastType = type;
                              } else {
                                type = lastType;
                              }
                              return (
                                <DefinitionCard
                                  key={anlam.anlam}
                                  definition={anlam.anlam}
                                  examples={anlam.orneklerListe?.map((o: Ornek) =>
                                    o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi
                                      ? `${o.ornek} — ${o.yazar[0].tam_adi}`
                                      : o.ornek
                                  )}
                                  type={type}
                                  onReferenceClick={handleSearch}
                                />
                              );
                            });
                          })()}
                        </div>
                        {/* Related phrases */}
                        {entry.birlesikler && (
                          <div className="mt-4">
                            <h3 className="text-base font-semibold mb-1">İlgili Birleşik Kelimeler</h3>
                            <div className="flex flex-wrap gap-2">
                              {entry.birlesikler.split(",").map((b: string, k: number) => (
                                <button
                                  key={k}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition cursor-pointer"
                                  type="button"
                                  onClick={() => handleSearch(b.trim())}
                                  tabIndex={0}
                                >
                                  {b.trim()}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Proverbs/Idioms */}
                        {entry.atasozu && Array.isArray(entry.atasozu) && entry.atasozu.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-base font-semibold mb-1">Atasözleri / Deyimler</h3>
                            <div className="flex flex-wrap gap-2">
                              {entry.atasozu.map((a: { madde: string }, l: number) => (
                                <button
                                  key={l}
                                  className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition cursor-pointer"
                                  type="button"
                                  onClick={() => handleSearch(a.madde)}
                                  tabIndex={0}
                                >
                                  {a.madde}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Anlam bulunamadı.</span>
                )}
              </div>
            </div>
          );
        })()}
        {/* /sozluk banner at the bottom, smaller */}
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 mt-12 mb-2 text-center text-sm">
          <h2 className="text-lg font-semibold mb-1 text-blue-700">Klasik Sözlük Görünümü</h2>
          <p className="text-gray-700 dark:text-gray-200 mb-2">
            Sözlüğü sayfa sayfa karıştırmak, yeni kelimeler öğrenmek ve dilin zenginliğini keşfetmek için harika bir yol! Dijital çağda unutulan bu alışkanlığı <b>Kolay Türkçe Sözlük</b> ile yeniden yaşayın.
          </p>
          <Link href="/sozluk" className="inline-block mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400">
            Sözlüğü Karıştır &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
