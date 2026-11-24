/**
 * Serialises structured data for an inline <script type="application/ld+json">.
 * JSON.stringify does not escape "<", so a value containing "</script>" would end the script
 * element early and let the rest run as HTML/JS. Replacing <, > and & with their JSON unicode
 * escapes keeps the JSON identical once parsed while making it inert inside HTML.
 *
 * Note the double backslash in the source: each replacement must be the six-character text
 * backslash-u-0-0-3-c. With a single backslash the JS string is just "<" again and nothing is
 * escaped. Guarded by src/lib/json-ld.test.ts.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
