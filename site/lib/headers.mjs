// One security baseline for static assets and Worker-rendered HTML.
// No script/style restrictions: the inline theme setup, charts and Turnstile remain usable.
export const SECURITY_HEADERS = Object.freeze({
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "interest-cohort=()",
  "Strict-Transport-Security": "max-age=15552000",
  "Content-Security-Policy": "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
});
