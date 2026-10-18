/**
 * Normalizes and formats Official Receipt (OR) numbers according to the
 * Janiuay Municipal standard: OR-YYYY-XXXX (e.g., OR-2026-8812).
 * 
 * Automatically resolves common issues:
 * - 3-digit year typos: OR-202-8812 / 202-8812 -> OR-2026-8812
 * - Raw sequential digits: 8812 -> OR-2026-8812
 * - 2-digit years: OR-26-8812 -> OR-2026-8812
 * - Year-sequence pairs: 2026-8812 -> OR-2026-8812
 * - Missing OR- prefix: 2026-8812 -> OR-2026-8812
 * - Missing / empty values: Fallbacks to OR-YYYY-TREAS
 */
export const normalizeOrNumber = (rawOr, fallbackYear = new Date().getFullYear()) => {
  if (!rawOr) return `OR-${fallbackYear}-TREAS`
  const str = String(rawOr).trim().toUpperCase()

  // 1. Correct 3-digit year typos such as OR-202-8812 or 202-8812 -> OR-2026-8812
  const typoMatch = str.match(/^(?:OR-)?20(\d)-(\d+)$/i)
  if (typoMatch) {
    const yearStr = String(fallbackYear)
    const correctedYear = yearStr.startsWith('20' + typoMatch[1]) ? yearStr : `20${typoMatch[1]}6`
    return `OR-${correctedYear}-${typoMatch[2]}`
  }

  // 2. Full official format OR-YYYY-XXXX
  if (/^OR-\d{4}-\d+$/i.test(str)) {
    return str
  }

  // 3. Pure sequential numeric receipts like 8812 or 008812
  if (/^\d{3,8}$/.test(str)) {
    return `OR-${fallbackYear}-${str}`
  }

  // 4. 2-digit year format OR-26-8812 or 26-8812
  const shortYearMatch = str.match(/^(?:OR-)?(\d{2})-(\d+)$/i)
  if (shortYearMatch) {
    return `OR-20${shortYearMatch[1]}-${shortYearMatch[2]}`
  }

  // 5. Year-dash-seq format like 2026-8812
  const yearDashMatch = str.match(/^(\d{4})-(\d+)$/)
  if (yearDashMatch) {
    return `OR-${yearDashMatch[1]}-${yearDashMatch[2]}`
  }

  // 6. Ensure OR- prefix
  if (!str.startsWith('OR-')) {
    return `OR-${str}`
  }

  return str
}

export default normalizeOrNumber
