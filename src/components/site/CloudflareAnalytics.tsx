import Script from "next/script";

/**
 * Cloudflare Web Analytics: a cookieless page-view beacon (no consent banner needed),
 * feeding the owner's private command centre. Production deploys only, so local dev and
 * preview deployments never skew the numbers. The token is public by design.
 */
const BEACON_TOKEN = "f9701bf0d48146b6a0e9560b9013917f";

export function CloudflareAnalytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
      strategy="afterInteractive"
    />
  );
}
