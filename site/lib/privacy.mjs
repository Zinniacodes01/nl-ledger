// Receipt URLs remain shareable, but an income does not belong in saved page context.
export function feedbackContext(path) {
  try {
    const url = new URL(path, "https://context.invalid");
    if (/^\/receipt(?:\/|$)/.test(decodeURIComponent(url.pathname))) return url.pathname;
  } catch { /* An invalid path is handled by the feedback input validator. */ }
  return path;
}
