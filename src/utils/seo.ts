/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a meta title to be SEO-optimized and within the 60-character limit
 */
export function formatMetaTitle(title: string): string {
  return truncateString(title, 60);
}

/**
 * Formats a meta description to be SEO-optimized and within the 155-character limit
 */
export function formatMetaDescription(description: string): string {
  return truncateString(description, 155);
} 