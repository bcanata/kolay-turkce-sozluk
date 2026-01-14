import Link from "next/link";
import DefinitionCard from "@/components/DefinitionCard";
import type { Anlam, AnlamResult, Ornek, ProverbResult, WordResults } from "@/lib/tdk";

interface WordResultsProps {
  searched: string;
  results: WordResults;
}

function buildSearchHref(term: string) {
  return `/ara/${encodeURIComponent(term.trim())}`;
}

function renderMeanings(entry: AnlamResult) {
  let lastType: string | undefined;
  return entry.anlamlarListe?.map((anlam: Anlam) => {
    let type: string | undefined;
    if (anlam.ozelliklerListe && Array.isArray(anlam.ozelliklerListe)) {
      type = anlam.ozelliklerListe.map((oz) => oz.tam_adi).join(", ");
      lastType = type;
    } else {
      type = lastType;
    }

    const examples = anlam.orneklerListe?.map((o: Ornek) =>
      o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi
        ? `${o.ornek} — ${o.yazar[0].tam_adi}`
        : o.ornek
    );

    return (
      <DefinitionCard
        key={`${entry.madde}-${anlam.anlam}`}
        definition={anlam.anlam}
        examples={examples}
        type={type}
        referenceHref={buildSearchHref}
      />
    );
  });
}

function renderProverbs(proverbs: ProverbResult[], mainMaddes: Set<string>) {
  const filtered = proverbs.filter(
    (entry) => !mainMaddes.has(entry.madde?.toLowerCase().trim())
  );
  if (filtered.length === 0) return null;
  const gridCols = filtered.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2";
  const maxW = filtered.length === 1 ? "max-w-3xl" : "max-w-4xl";

  return (
    <div className={`w-full ${maxW} mt-10 space-y-6`}>
      <div>
        <h2 className="text-xl font-semibold mb-2">Atasözleri ve Deyimler</h2>
        <div className={`grid ${gridCols} gap-6`}>
          {filtered.map((entry) => (
            <div
              key={entry.madde}
              className="p-4 rounded-xl border border-amber-200 bg-white/90 shadow-sm dark:border-amber-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <span className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  {entry.madde}
                </span>
              </div>
              <div className="space-y-4">
                {entry.anlamlarListe?.map((anlam: Anlam) => {
                  const type = anlam.ozelliklerListe?.map((oz) => oz.tam_adi).join(", ");
                  const examples = anlam.orneklerListe?.map((o: Ornek) =>
                    o.yazar && Array.isArray(o.yazar) && o.yazar[0]?.tam_adi
                      ? `${o.ornek} — ${o.yazar[0].tam_adi}`
                      : o.ornek
                  );
                  return (
                    <DefinitionCard
                      key={`${entry.madde}-${anlam.anlam}`}
                      definition={anlam.anlam}
                      examples={examples}
                      type={type}
                      referenceHref={buildSearchHref}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WordResultsView({ searched, results }: WordResultsProps) {
  const mainMaddes = new Set(
    (results.anlam || []).map((entry) => entry.madde?.toLowerCase().trim())
  );
  const anlamCount = results.anlam?.length || 0;
  const gridCols = anlamCount === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2";
  const maxW = anlamCount === 1 ? "max-w-3xl" : "max-w-4xl";

  return (
    <>
      {renderProverbs(results.proverbs, mainMaddes)}
      <div className={`w-full ${maxW} mt-10 space-y-6`}>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Arama
          </span>
          <div className="flex flex-wrap items-center gap-3 text-sm text-amber-900 dark:text-amber-200">
            <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold dark:bg-amber-900/40">
              {searched}
            </span>
            {results.yazim?.map((item) => (
              <span
                key={item.sozu}
                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              >
                {item.sozu}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Anlamlar</h2>
          {Array.isArray(results.anlam) && results.anlam.length > 0 ? (
            <div className={`grid ${gridCols} gap-6`}>
              {results.anlam.map((entry) => (
                <div
                  key={entry.madde}
                  className="p-4 rounded-xl border border-amber-100 bg-white/90 shadow-sm dark:border-amber-800 dark:bg-gray-900"
                >
                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="text-lg font-bold">{entry.madde}</span>
                    {entry.telaffuz && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {entry.telaffuz} /
                      </span>
                    )}
                    {entry.lisan && (
                      <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5 ml-2 dark:bg-amber-900 dark:text-amber-200">
                        {entry.lisan}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">{renderMeanings(entry)}</div>

                  {entry.birlesikler && (
                    <div className="mt-4">
                      <h3 className="text-base font-semibold mb-1">İlgili Birleşik Kelimeler</h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.birlesikler.split(",").map((b) => (
                          <Link
                            key={b}
                            className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-200 dark:bg-amber-900/60 dark:text-amber-200 dark:hover:bg-amber-800"
                            href={buildSearchHref(b)}
                          >
                            {b.trim()}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.atasozu && entry.atasozu.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-base font-semibold mb-1">Atasözleri / Deyimler</h3>
                      <div className="flex flex-wrap gap-2">
                        {entry.atasozu.map((a) => (
                          <Link
                            key={a.madde}
                            className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-200 dark:bg-rose-900/60 dark:text-rose-200 dark:hover:bg-rose-800"
                            href={buildSearchHref(a.madde)}
                          >
                            {a.madde}
                          </Link>
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
    </>
  );
}
