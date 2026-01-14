import type { Metadata } from "next";
import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";

export const metadata: Metadata = {
  title: "Kolay Türkçe Sözlük",
  description:
    "Türkçe kelimelerin anlamları, kökenleri, örnekleri ve atasözleri. Hızlı arama, klasik sözlük görünümü ve temiz sonuçlar.",
};

const quickLinks = ["merhamet", "kültür", "sükunet", "müsaade", "insan", "zaman"];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
            Modern Türkçe sözlük
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-amber-900 dark:text-amber-100 sm:text-5xl">
            Kelimeleri keşfet, anlamı sez, dilin ritmini yakala.
          </h1>
          <p className="text-base text-[var(--muted)] sm:text-lg">
            TDK verileriyle çalışan, hızlı ve temiz bir sözlük deneyimi. Yazım kontrolü,
            örnekler, kökenler ve deyimleri tek ekranda görün.
          </p>
          <SearchPanel autoFocus />
          <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
            <span>Popüler:</span>
            {quickLinks.map((word) => (
              <Link
                key={word}
                href={`/ara/${encodeURIComponent(word)}`}
                className="rounded-full border border-amber-200 px-3 py-1 font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
              >
                {word}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-white/80 p-6 shadow-lg dark:border-amber-900 dark:bg-gray-950/70">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Neler var?</h2>
          <div className="mt-4 space-y-4 text-sm text-[var(--muted)]">
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">Yazım + anlam</p>
              <p>Doğru yazım, anlam ve örnekleri tek aramada görün.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">Deyimler ve atasözleri</p>
              <p>Aynı kökten türeyen kalıpları sonuçların içinde yakalayın.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">Klasik sözlük modu</p>
              <p>Sayfa sayfa gezerek yeni kelimelere denk gelin.</p>
            </div>
          </div>
          <Link
            href="/sozluk"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
          >
            Sözlüğü karıştır →
          </Link>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-amber-100 bg-white/70 p-6 shadow-sm dark:border-amber-900 dark:bg-gray-950/70 sm:grid-cols-3">
        {[
          {
            title: "Hızlı arama",
            detail: "Yerel otomatik tamamlama ile anında sonuçlar.",
          },
          {
            title: "Okunabilir sonuçlar",
            detail: "Net kartlar, örnekler ve bağlantılar.",
          },
          {
            title: "Mobil uyumlu",
            detail: "Tek kolon, büyük dokunma alanları, kolay gezinme.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{item.title}</p>
            <p className="text-sm text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
