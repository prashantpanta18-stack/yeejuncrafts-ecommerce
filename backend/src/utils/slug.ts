/**
 * Convert a human title into a URL-friendly slug.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

module.exports = { generateSlug };

