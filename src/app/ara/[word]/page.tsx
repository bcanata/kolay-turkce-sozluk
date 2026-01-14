import type { Metadata } from "next";
import SearchPanel from "@/components/SearchPanel";
import WordResultsView from "@/components/WordResults";
import { getWordResults } from "@/lib/tdk";

function decodeParam(value: string | string[] | undefined) {
  if (!value) return "";
  const raw = Array.isArray(value) ? value[0] : value;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { word: string };
}): Promise<Metadata> {
  const searched = decodeParam(params.word);
  const title = searched ? `Kolay Türkçe Sözlük – ${searched}` : "Kolay Türkçe Sözlük";
  const description = searched
    ? `${searched} kelimesinin anlamı, kökeni, örnekleri ve daha fazlası.`
    : "Hızlı ve güvenilir Türkçe sözlük deneyimi.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SearchWordPage({
  params,
}: {
  params: { word: string };
}) {
  const searched = decodeParam(params.word).trim();
  const results = searched ? await getWordResults(searched) : null;

  const empty =
    !searched ||
    !results ||
    (results.yazim.length === 0 && results.anlam.length === 0 && results.proverbs.length === 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-12">
      <div className="w-full max-w-2xl lg:max-w-4xl">
        <SearchPanel initialValue={searched} compact />
      </div>

      {empty ? (
        <div className="w-full max-w-2xl rounded-2xl border border-amber-100 bg-white/90 p-6 text-center shadow-sm dark:border-amber-900 dark:bg-gray-950/70">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Sonuç bulunamadı
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Farklı bir yazım deneyin ya da benzer bir kelime arayın.
          </p>
        </div>
      ) : (
        <WordResultsView searched={searched} results={results} />
      )}
    </div>
  );
}
