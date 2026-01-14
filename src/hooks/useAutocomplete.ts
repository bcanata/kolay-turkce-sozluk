import { useEffect, useMemo, useState, useDeferredValue } from "react";

export function useAutocomplete(query: string) {
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    // Temporarily disabled cache to debug
    // const cached = readCache();
    // if (cached?.items?.length) {
    //   setList(cached.items);
    //   setLoading(false);
    //   return;
    // }
    let cancelled = false;
    fetch("https://sozluk.gov.tr/autocomplete.json")
      .then((res) => res.json())
      .then((data: { madde: string }[]) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          const items = data
            .map((d) => d.madde)
            .filter((item) => item.toLocaleLowerCase("tr") !== "taşaklı");
          setList(items);
          // writeCache(items);
        }
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!deferredQuery) return [];
    const q = deferredQuery.toLocaleLowerCase("tr");
    return list
      .filter((word) => word.toLocaleLowerCase("tr").startsWith(q))
      .slice(0, 20);
  }, [deferredQuery, list]);

  return { suggestions, loading, hasData: list.length > 0 };
}
