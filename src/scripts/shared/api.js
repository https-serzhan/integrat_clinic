(function attachClinicApi(windowObject) {
  const config = windowObject.IntegratConfig || {};
  const fallbackLocalOrigin = 'http://localhost:3000';
  const UrlConstructor = windowObject.URL || (typeof URL !== 'undefined' ? URL : null);

  function parseUrl(value) {
    if (!UrlConstructor) return null;
    try {
      return new UrlConstructor(String(value || ''));
    } catch {
      return null;
    }
  }

  function isLoopbackHostname(hostname) {
    const normalized = String(hostname || '').toLowerCase();
    return normalized === 'localhost' || normalized === '127.0.0.1';
  }

  function normalizeLoopbackBaseUrl(candidate, currentOrigin) {
    const candidateUrl = parseUrl(candidate);
    const currentUrl = parseUrl(currentOrigin);
    if (!candidateUrl || !currentUrl) return candidate;

    const matchingPort = (candidateUrl.port || '') === (currentUrl.port || '');
    const matchingProtocol = candidateUrl.protocol === currentUrl.protocol;
    if (
      matchingPort &&
      matchingProtocol &&
      isLoopbackHostname(candidateUrl.hostname) &&
      isLoopbackHostname(currentUrl.hostname)
    ) {
      return currentUrl.origin;
    }

    return candidateUrl.origin;
  }

  const origin = windowObject.location.origin && windowObject.location.origin !== 'null'
    ? windowObject.location.origin
    : fallbackLocalOrigin;
  const explicitBaseUrl = String(config.clinicApiBaseUrl || '').trim();
  const hostname = String(windowObject.location.hostname || '').toLowerCase();
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const defaultLocalBackend = fallbackLocalOrigin;
  const inferredBaseUrl = explicitBaseUrl
    ? normalizeLoopbackBaseUrl(explicitBaseUrl, origin)
    : (isLocalHost && !/:3000$/.test(origin) ? defaultLocalBackend : origin);
  const baseUrl = String(inferredBaseUrl || defaultLocalBackend).replace(/\/$/, '');

  function resolveUrl(endpoint, currentBaseUrl = baseUrl) {
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    return `${currentBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  function readClinicToken() {
    try {
      return windowObject.localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  function clearClinicToken() {
    try {
      windowObject.localStorage.removeItem('token');
    } catch {}
  }

  async function request(endpoint, options = {}) {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const shouldTryApiPrefix = !/^\/api\//.test(normalizedEndpoint);
    const candidates = [normalizedEndpoint];
    if (shouldTryApiPrefix) {
      candidates.push(`/api${normalizedEndpoint}`);
    }
    const baseCandidates = [baseUrl];
    if (isLocalHost && baseUrl !== defaultLocalBackend) {
      baseCandidates.push(defaultLocalBackend);
    }

    let lastError = null;
    for (const currentBaseUrl of baseCandidates) {
      for (const currentEndpoint of candidates) {
        try {
          return await performRequest(currentBaseUrl, currentEndpoint, options);
        } catch (error) {
          lastError = error;
          const isNotFound = error?.status === 404;
          const isNetworkError = error?.status === undefined;
          if (!isNotFound && !isNetworkError) {
            throw error;
          }
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  async function performRequest(currentBaseUrl, endpoint, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    const token = readClinicToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const isJsonBody = options.body && !(options.body instanceof FormData);
    if (isJsonBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(resolveUrl(endpoint, currentBaseUrl), {
      ...options,
      headers
    });

    const raw = await response.text();
    let payload = null;

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && (payload.detail || payload.error)) ||
        (typeof payload === 'string' && payload) ||
        `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  const api = {
    baseUrl,
    request,
    get(endpoint) {
      return request(endpoint, { method: 'GET' });
    },
    post(endpoint, body) {
      return request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },
    async logout() {
      try {
        return await request('/auth/logout', { method: 'POST' });
      } finally {
        clearClinicToken();
      }
    },
    put(endpoint, body) {
      return request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
    },
    delete(endpoint) {
      return request(endpoint, { method: 'DELETE' });
    }
  };

  windowObject.IntegratClinicApi = api;
  windowObject.api = api;
})(window);
