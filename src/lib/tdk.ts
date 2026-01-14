export interface YazimResult {
  sozu: string;
}

export interface Ornek {
  ornek: string;
  yazar?: { tam_adi: string }[];
}

export interface Anlam {
  anlam: string;
  ozelliklerListe?: { tam_adi: string }[];
  orneklerListe?: Ornek[];
}

export interface AnlamResult {
  madde: string;
  telaffuz?: string;
  lisan?: string;
  anlamlarListe?: Anlam[];
  birlesikler?: string;
  atasozu?: { madde: string }[];
}

export interface ProverbResult {
  madde: string;
  anlamlarListe?: Anlam[];
}

export interface WordResults {
  yazim: YazimResult[];
  anlam: AnlamResult[];
  proverbs: ProverbResult[];
}

const API_BASE = "https://sozluk.gov.tr";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`TDK API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getAutocompleteList(): Promise<string[]> {
  const data = await fetchJson<{ madde: string }[]>(
    `${API_BASE}/autocomplete.json`,
    { next: { revalidate: 86400 } }
  );
  if (!Array.isArray(data)) return [];
  return data.map((item) => item.madde);
}

export async function getCircumflexMap(): Promise<Record<string, string>> {
  const data = await fetchJson<Record<string, string>>(
    `${API_BASE}/assets/js/autocompleteSapka.json`,
    { next: { revalidate: 86400 } }
  );
  return data || {};
}

export async function getWordResults(word: string): Promise<WordResults> {
  const encoded = encodeURIComponent(word);
  const [yazim, anlam, proverbs] = await Promise.all([
    fetchJson<YazimResult[]>(
      `${API_BASE}/yazim?ara=${encoded}`,
      { next: { revalidate: 300 } }
    ).catch(() => []),
    fetchJson<AnlamResult[]>(
      `${API_BASE}/gts?ara=${encoded}`,
      { next: { revalidate: 300 } }
    ).catch(() => []),
    fetchJson<ProverbResult[]>(
      `${API_BASE}/gtsAtasozDeyim?ara=${encoded}`,
      { next: { revalidate: 300 } }
    ).catch(() => []),
  ]);

  return {
    yazim: Array.isArray(yazim) ? yazim : [],
    anlam: Array.isArray(anlam) ? anlam : [],
    proverbs: Array.isArray(proverbs) ? proverbs : [],
  };
}
