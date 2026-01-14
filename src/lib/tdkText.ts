export function replaceOffensiveTerms(text: string): string {
  return text.replace(/\btaşak\b/giu, "er bezi");
}

export function cleanMeaningText(text: string): string {
  if (!text) return text;
  let cleaned = text;
  cleaned = cleaned.replace(/►\s*taşaklı\b[.,;]?/giu, "");
  cleaned = cleaned.replace(/,\s*taşaklı\b/giu, "");
  cleaned = cleaned.replace(/taşaklı,\s*/giu, "");
  cleaned = cleaned.replace(/►\s*,?\s*$/giu, "");
  const normalized = cleaned.trim().toLocaleLowerCase("tr");
  if (normalized === "taşaklı" || normalized === "► taşaklı") return "";
  return cleaned;
}

export function stripReferenceNumber(text: string): string {
  return text.replace(/^\d+\s+/, "");
}

export function cleanReference(ref: string): string {
  return ref.replace(/^►\s*/, "");
}
