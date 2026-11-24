const FALLBACK = "/admin";
// Any fixed origin works: it is only used to see whether `raw` would leave the site.
const PROBE_ORIGIN = "http://same-origin.invalid";

/**
 * Where to send the user after login. Only a same-origin relative path inside the admin area
 * (`/admin` or `/admin/...`) is allowed; anything else — absolute or protocol-relative URLs,
 * backslash tricks, `javascript:` and friends, paths outside /admin, the login page itself —
 * falls back to `/admin`. Prevents the login page acting as an open redirect.
 */
export function safeAdminCallback(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return FALLBACK;

  let url: URL;
  try {
    url = new URL(raw, PROBE_ORIGIN);
  } catch {
    return FALLBACK;
  }
  const { origin, pathname, search, hash } = url;
  if (origin !== PROBE_ORIGIN || pathname.includes("//")) return FALLBACK;
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return FALLBACK;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return FALLBACK;
  return pathname + search + hash;
}
