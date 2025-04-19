import React from "react";

interface DefinitionCardProps {
  definition: string;
  examples?: string[];
  type?: string;
  onReferenceClick?: (ref: string) => void;
}

function replaceTasak(text: string): string {
  return text.replace(/\btaşak\b/giu, "er bezi");
}

function cleanMeaningText(text: string): string {
  if (!text) return text;
  text = text.replace(/►\s*taşaklı\b[.,;]?/giu, "");
  text = text.replace(/,\s*taşaklı\b/giu, "");
  text = text.replace(/taşaklı,\s*/giu, "");
  text = text.replace(/►\s*,?\s*$/giu, "");
  if (text.trim().toLocaleLowerCase("tr") === "taşaklı" || text.trim().toLocaleLowerCase("tr") === "► taşaklı") return "";
  return text;
}

function stripReferenceNumber(text: string): string {
  // Remove leading number(s) and space, e.g., '343 süre sonu' -> 'süre sonu'
  return text.replace(/^\d+\s+/, "");
}

function cleanReference(ref: string): string {
  // Remove leading '►' and whitespace
  return ref.replace(/^►\s*/, "");
}

export default function DefinitionCard({ definition, examples, type, onReferenceClick }: DefinitionCardProps) {
  // Sanitize definition and examples
  const sanitizedDef = cleanMeaningText(replaceTasak(definition));
  const sanitizedExamples = examples?.map(e => replaceTasak(e)).filter(Boolean);
  if (!sanitizedDef) return null;
  // Remove leading reference number
  const defNoRef = stripReferenceNumber(sanitizedDef);

  // If definition starts with 'bakınız', extract and render reference as clickable
  const bakinizMatch = defNoRef.trim().toLocaleLowerCase("tr").startsWith("bakınız")
    ? defNoRef.match(/^bakınız\s+([^.]+)[.\s]*$/i)
    : null;

  // If the definition is just a short phrase (1-3 words), treat as reference
  const isShortReference = !bakinizMatch && defNoRef.trim().split(/\s+/).length <= 3 && !/[.!?]/.test(defNoRef.trim());

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        {type && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
            {type}
          </span>
        )}
        {defNoRef && bakinizMatch ? (
          <span className="italic text-gray-700 dark:text-gray-200">
            bakınız{' '}
            {onReferenceClick ? (
              <button
                type="button"
                className="underline text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 cursor-pointer"
                onClick={() => onReferenceClick(cleanReference(bakinizMatch[1].trim()))}
              >
                {bakinizMatch[1].trim()}
              </button>
            ) : (
              <span className="underline">{bakinizMatch[1].trim()}</span>
            )}
          </span>
        ) : defNoRef && isShortReference && onReferenceClick ? (
          <span className="italic text-gray-700 dark:text-gray-200">
            bakınız{' '}
            <button
              type="button"
              className="underline text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 cursor-pointer font-medium"
              onClick={() => onReferenceClick(cleanReference(defNoRef.trim()))}
            >
              {defNoRef.trim()}
            </button>
          </span>
        ) : defNoRef && (
          <span className="font-medium text-gray-800 dark:text-gray-100">{defNoRef}</span>
        )}
      </div>
      {sanitizedExamples && sanitizedExamples.length > 0 && (
        <ul className="mt-2 space-y-1">
          {sanitizedExamples.map((ex, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 border-l-4 border-blue-300 pl-2 italic">“{ex}”</li>
          ))}
        </ul>
      )}
    </div>
  );
} 