/**
 * Format numbers and prices for Persian display.
 */

/**
 * Format a number with Persian/Arabic-Indic digits (۰۱۲۳۴۵۶۷۸۹) and thousands separators.
 */
export function formatNumber(value: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(value);
  return formatted;
}

/**
 * Format a price in Toman with Persian digits and the تومان suffix.
 * Input is an integer representing Toman.
 */
export function formatToman(amount: number): string {
  return `${formatNumber(amount)} تومان`;
}

/**
 * Convert Arabic-Indic digits (۰-۹) to Western digits (0-9).
 * Useful for normalizing user input before validation.
 */
export function toWesternDigits(str: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return str
    .split("")
    .map((char) => {
      const pIndex = persianDigits.indexOf(char);
      if (pIndex !== -1) return pIndex.toString();
      const aIndex = arabicDigits.indexOf(char);
      if (aIndex !== -1) return aIndex.toString();
      return char;
    })
    .join("");
}
