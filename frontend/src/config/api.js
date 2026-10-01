/**
 * Centralized API configuration, route builder, and response handler.
 * Ensures the production frontend communicates with the Render backend
 * strictly following: ${VITE_API_URL}/api/...
 *
 * Requirements:
 * 1. VITE_API_URL contains ONLY the backend origin (e.g. https://MY-RENDER-BACKEND-URL.onrender.com).
 * 2. Login request appends /api/auth/login -> https://MY-RENDER-BACKEND-URL.onrender.com/api/auth/login.
 * 3. Never produces /auth/login (missing /api).
 * 4. Never produces /api/api/... (duplicate /api).
 * 5. All routes (/api/auth/register, /api/auth/login, /api/auth/me, /api/rooms, /api/allocations, etc.)
 *    are cleanly constructed through buildApiUrl().
 */

// 1. Resolve raw backend origin from environment variable or local development fallback
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();

// 2. Extract clean backend origin: strip trailing slashes and any trailing /api
// e.g. "https://MY-RENDER-BACKEND-URL.onrender.com/" -> "https://MY-RENDER-BACKEND-URL.onrender.com"
// e.g. "https://MY-RENDER-BACKEND-URL.onrender.com/api" -> "https://MY-RENDER-BACKEND-URL.onrender.com"
export const BACKEND_ORIGIN = rawApiUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '');

// 3. Centralized API base URL that cleanly terminates with /api
export const API_BASE = `${BACKEND_ORIGIN}/api`;

/**
 * Centrally construct complete API endpoint URLs.
 * Handles:
 * - buildApiUrl('/api/auth/login')        -> https://.../api/auth/login
 * - buildApiUrl('/auth/login')            -> https://.../api/auth/login
 * - buildApiUrl('api/auth/login')         -> https://.../api/auth/login
 * - buildApiUrl('auth/login')             -> https://.../api/auth/login
 * - buildApiUrl('/api/rooms/available')   -> https://.../api/rooms/available
 * - buildApiUrl('/rooms/available')       -> https://.../api/rooms/available
 * 
 * Guarantees:
 * - NEVER omits /api (never generates /auth/login)
 * - NEVER duplicates /api (never generates /api/api/auth/login)
 */
export function buildApiUrl(endpoint = '') {
  const clean = String(endpoint).trim();
  if (!clean || clean === '/' || clean === '/api' || clean === 'api') {
    return API_BASE;
  }

  // Already prefixed with /api/...
  if (clean.startsWith('/api/')) {
    return `${BACKEND_ORIGIN}${clean}`;
  }
  if (clean.startsWith('api/')) {
    return `${BACKEND_ORIGIN}/${clean}`;
  }

  // Path provided without /api (e.g. /auth/login or auth/login)
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${API_BASE}${path}`;
}

/**
 * Centralized API fetch wrapper that automatically:
 * 1. Resolves url via buildApiUrl (ensuring correct /api prefix)
 * 2. Executes window.fetch
 * 3. Safely parses JSON with parseApiResponse
 */
export async function apiFetch(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, options);
  return parseApiResponse(response);
}

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
