export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-amber-100 bg-white/60 py-6 text-sm text-gray-600 dark:border-amber-900 dark:bg-gray-950/60 dark:text-gray-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <span>TDK verileri kullanılır. Yanlışlıklar için kaynakla karşılaştırın.</span>
        <span className="text-xs text-gray-400">© {new Date().getFullYear()} Kolay Türkçe Sözlük</span>
      </div>
    </footer>
  );
}
