import Link from "next/link";
// Temporarily disabled to debug
// import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="w-full border-b border-amber-100 bg-white/70 backdrop-blur dark:border-amber-900 dark:bg-gray-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-amber-900 dark:text-amber-100">
            Kolay Türkçe Sözlük
          </Link>
          <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 sm:inline-block dark:bg-amber-900/60 dark:text-amber-200">
            Modern Türkçe rehber
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/sozluk"
            className="rounded-full border border-transparent px-3 py-1 text-sm font-semibold text-gray-600 hover:border-amber-200 hover:text-amber-700 dark:text-gray-300 dark:hover:border-amber-700 dark:hover:text-amber-200"
          >
            Sözlüğü Karıştır
          </Link>
          {/* <ThemeToggle /> */}
        </nav>
      </div>
    </header>
  );
}
