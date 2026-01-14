import Link from "next/link";
import React from "react";
import { cleanMeaningText, cleanReference, replaceOffensiveTerms, stripReferenceNumber } from "@/lib/tdkText";

interface DefinitionCardProps {
  definition: string;
  examples?: string[];
  type?: string;
  referenceHref?: (ref: string) => string;
}

export default function DefinitionCard({ definition, examples, type, referenceHref }: DefinitionCardProps) {
  // Sanitize definition and examples
  const sanitizedDef = cleanMeaningText(replaceOffensiveTerms(definition));
  const sanitizedExamples = examples?.map(e => replaceOffensiveTerms(e)).filter(Boolean);
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
            {referenceHref ? (
              <Link
                href={referenceHref(cleanReference(bakinizMatch[1].trim()))}
                className="underline text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 cursor-pointer"
              >
                {bakinizMatch[1].trim()}
              </Link>
            ) : (
              <span className="underline">{bakinizMatch[1].trim()}</span>
            )}
          </span>
        ) : defNoRef && isShortReference && referenceHref ? (
          <span className="italic text-gray-700 dark:text-gray-200">
            bakınız{' '}
            <Link
              href={referenceHref(cleanReference(defNoRef.trim()))}
              className="underline text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 cursor-pointer font-medium"
            >
              {defNoRef.trim()}
            </Link>
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
