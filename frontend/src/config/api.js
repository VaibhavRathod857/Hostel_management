/**
 * Centralized API configuration and response handling.
 * Ensures the production frontend communicates with the Render backend
 * using the proper base URL structure: ${VITE_API_URL}/api/...
 */

// 1. Resolve base backend URL from environment or local development fallback
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();

// 2. Strip any trailing slashes
const sanitizedUrl = rawApiUrl.replace(/\/+$/, '');

// 3. Ensure the base URL cleanly terminates with /api
export const API_BASE = sanitizedUrl.endsWith('/api')
  ? sanitizedUrl
  : `${sanitizedUrl}/api`;

/**
 * Robust response parser that safely handles JSON and non-JSON (HTML/Text) responses.
 * Prevents the application from crashing with:
 * "Unexpected token '<', '<!DOCTYPE '... is not valid JSON"
 * 
 * If a non-JSON or HTML response is returned (e.g. from Render spin-up, Vercel SPA rewrites, or proxy 404/502),
 * it throws a clear, user-friendly error that preserves actionable diagnostic information.
 */
export async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn('Failed to parse response as JSON despite application/json header:', parseError);
    }
  } else {
    // Non-JSON response (e.g. HTML 404/502 from reverse proxy, Render cold start, or wrong endpoint)
    const rawText = await response.text();
    const isHtml =
      rawText.trim().startsWith('<') ||
      rawText.toLowerCase().includes('<!doctype') ||
      contentType.includes('text/html');

    if (isHtml) {
      const statusNote = `HTTP ${response.status} ${response.statusText || ''}`.trim();
      const err = new Error(
        `Unable to connect to the server. Please try again. (API returned HTML response: ${statusNote})`
      );
      err.status = response.status;
      err.isHtmlResponse = true;
      throw err;
    }

    try {
      data = JSON.parse(rawText);
    } catch {
      // Raw non-JSON text
    }
  }

  // Handle HTTP error statuses or API-level success: false payloads
  if (!response.ok || (data && data.success === false)) {
    const errorMsg =
      data?.message ||
      `Request failed with status ${response.status} (${response.statusText || 'Error'})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
