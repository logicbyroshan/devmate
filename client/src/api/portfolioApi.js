const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TIME_API = typeof window !== 'undefined' ? window : globalThis;
const CACHE_KEY = 'portfolio-bootstrap-cache-v1';

function resolveApiBaseUrl() {
  if (typeof window === 'undefined') {
    return CONFIGURED_API_BASE_URL;
  }

  const hostname = window.location.hostname;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (!isLocalHost) {
    return CONFIGURED_API_BASE_URL;
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(CONFIGURED_API_BASE_URL);
  if (!isAbsoluteUrl) {
    return CONFIGURED_API_BASE_URL;
  }

  // On localhost previews, use the local proxy to avoid external DNS/CORS failures.
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const DEFAULT_API_TIMEOUT_MS = parsePositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 7000);
const DEFAULT_API_RETRY_ATTEMPTS = parsePositiveInt(import.meta.env.VITE_API_RETRY_ATTEMPTS, 1);
const DEFAULT_BOOTSTRAP_CACHE_TTL_MS = parsePositiveInt(
  import.meta.env.VITE_PORTFOLIO_CACHE_TTL_MS,
  5 * 60 * 1000,
);

let portfolioCache = null;
let portfolioCacheExpiresAt = 0;
let inFlightPortfolioRequest = null;

function withBase(path) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson(path, options = {}) {
  const timeoutMs = parsePositiveInt(options.timeoutMs, DEFAULT_API_TIMEOUT_MS);
  const retryAttempts = parsePositiveInt(options.retryAttempts, DEFAULT_API_RETRY_ATTEMPTS);
  const method = options.method || 'GET';
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  let body = undefined;
  if (options.body) {
    if (typeof options.body === 'string') {
      body = options.body;
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else {
      body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  let lastError = null;

  for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = TIME_API.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(withBase(path), {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const serverError = response.status >= 500;
        if (serverError && attempt < retryAttempts) {
          continue;
        }

        let errorMessage = `API request failed: ${response.status} ${path}`;
        try {
          const errData = await response.json();
          if (errData?.message) errorMessage = errData.message;
          else if (errData?.detail) errorMessage = errData.detail;
        } catch {
          // ignore non-json error responses
        }

        const err = new Error(errorMessage);
        err.status = response.status;
        throw err;
      }

      return response.json();
    } catch (error) {
      lastError = error;
      const isAbort = error?.name === 'AbortError';
      const isNetwork = error instanceof TypeError;
      const canRetry = attempt < retryAttempts;

      if (!canRetry || (!isAbort && !isNetwork)) {
        throw error;
      }
    } finally {
      TIME_API.clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error(`API request failed: ${path}`);
}

function unwrapResults(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function buildPortfolioPayload(payload) {
  const source = payload || {};

  return {
    profile: source.profile && !Array.isArray(source.profile) ? source.profile : null,
    projects: unwrapResults(source.projects),
    skills: unwrapResults(source.skills),
    experience: unwrapResults(source.experience),
  };
}

function readCachedPortfolioPayload() {
  const now = Date.now();

  if (portfolioCache && now < portfolioCacheExpiresAt) {
    return portfolioCache;
  }

  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.expiresAt <= now || !parsed.data) {
      storage.removeItem(CACHE_KEY);
      return null;
    }

    portfolioCache = parsed.data;
    portfolioCacheExpiresAt = parsed.expiresAt;
    return portfolioCache;
  } catch {
    return null;
  }
}

function writeCachedPortfolioPayload(payload) {
  const now = Date.now();
  const expiresAt = now + DEFAULT_BOOTSTRAP_CACHE_TTL_MS;

  portfolioCache = payload;
  portfolioCacheExpiresAt = expiresAt;

  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.setItem(
      CACHE_KEY,
      JSON.stringify({
        expiresAt,
        data: payload,
      }),
    );
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

export function clearPortfolioCache() {
  portfolioCache = null;
  portfolioCacheExpiresAt = 0;
  const storage = getSessionStorage();
  if (storage) {
    try {
      storage.removeItem(CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

function settledValue(result) {
  if (result.status !== 'fulfilled') {
    return null;
  }

  return result.value;
}

/**
 * Fetch unified bootstrap payload for home view.
 */
export async function fetchPortfolioData(forceRefresh = false) {
  if (forceRefresh) {
    clearPortfolioCache();
  } else {
    const cachedPayload = readCachedPortfolioPayload();
    if (cachedPayload) {
      return cachedPayload;
    }
  }

  if (inFlightPortfolioRequest) {
    return inFlightPortfolioRequest;
  }

  inFlightPortfolioRequest = (async () => {
    try {
      const bootstrapPayload = await requestJson('/bootstrap/', {
        retryAttempts: Math.max(DEFAULT_API_RETRY_ATTEMPTS, 2),
      });
      const normalized = buildPortfolioPayload(bootstrapPayload);
      writeCachedPortfolioPayload(normalized);
      return normalized;
    } catch {
      const [profileResult, projectsResult, skillsResult, experienceResult] = await Promise.allSettled([
        requestJson('/profile/'),
        requestJson('/projects/'),
        requestJson('/skills/'),
        requestJson('/experience/'),
      ]);

      const fallbackPayload = buildPortfolioPayload({
        profile: settledValue(profileResult),
        projects: settledValue(projectsResult),
        skills: settledValue(skillsResult),
        experience: settledValue(experienceResult),
      });

      writeCachedPortfolioPayload(fallbackPayload);
      return fallbackPayload;
    } finally {
      inFlightPortfolioRequest = null;
    }
  })();

  return inFlightPortfolioRequest;
}

/**
 * Fetch all active projects dynamically from API.
 */
export async function fetchProjects() {
  const data = await requestJson('/projects/');
  return unwrapResults(data);
}

/**
 * Fetch single project by slug from API.
 */
export async function fetchProjectBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = encodeURIComponent(String(slug).trim());
  return requestJson(`/projects/${cleanSlug}/`);
}

/**
 * Fetch all active skills from API.
 */
export async function fetchSkills() {
  const data = await requestJson('/skills/');
  return unwrapResults(data);
}

/**
 * Fetch all active work experiences from API.
 */
export async function fetchExperiences() {
  const data = await requestJson('/experience/');
  return unwrapResults(data);
}

/**
 * Fetch single experience by slug from API.
 */
export async function fetchExperienceBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = encodeURIComponent(String(slug).trim());
  return requestJson(`/experience/${cleanSlug}/`);
}

/**
 * Fetch all active achievements from API.
 */
export async function fetchAchievements() {
  const data = await requestJson('/achievements/');
  return unwrapResults(data);
}

/**
 * Fetch user profile from API.
 */
export async function fetchProfile() {
  return requestJson('/profile/');
}

/**
 * Fetch aggregated portfolio summary metrics from API.
 */
export async function fetchSummary() {
  return requestJson('/summary/');
}

/**
 * Increment project likes counter on backend.
 */
export async function likeProject(slug) {
  if (!slug) return { success: false };
  const cleanSlug = encodeURIComponent(String(slug).trim());
  return requestJson(`/projects/${cleanSlug}/like/`, { method: 'POST' });
}

/**
 * Increment project views counter on backend.
 */
export async function viewProject(slug) {
  if (!slug) return { success: false };
  const cleanSlug = encodeURIComponent(String(slug).trim());
  return requestJson(`/projects/${cleanSlug}/view/`, { method: 'POST' });
}

/**
 * Submit public contact message.
 */
export async function submitContactMessage(payload) {
  return requestJson('/contact/', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Send Rexi AI assistant chat prompt.
 */
export async function sendRexiChatMessage(message) {
  return requestJson('/rexi/chat/', {
    method: 'POST',
    body: { message },
  });
}

/**
 * Fetch all published blog articles summary list.
 */
export async function fetchBlogs() {
  const data = await requestJson('/blogs/');
  return unwrapResults(data);
}

/**
 * Fetch a single blog article by slug.
 */
export async function fetchBlogBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = encodeURIComponent(String(slug).trim());
  const res = await requestJson(`/blogs/${cleanSlug}/`);
  return res?.data || res;
}

export { API_BASE_URL };
