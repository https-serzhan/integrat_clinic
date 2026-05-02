(function attachAuthApi(windowObject) {
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

  const currentOrigin = windowObject.location.origin && windowObject.location.origin !== 'null'
    ? windowObject.location.origin
    : fallbackLocalOrigin;
  const configuredBaseUrl = String(config.academyApiBaseUrl || '').trim();
  const baseUrl = String(
    (configuredBaseUrl ? normalizeLoopbackBaseUrl(configuredBaseUrl, currentOrigin) : currentOrigin) || fallbackLocalOrigin
  ).replace(/\/$/, '');

  function resolveUrl(path) {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async function request(path, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    const isJsonBody = options.body && !(options.body instanceof FormData);
    if (isJsonBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(resolveUrl(path), {
      credentials: 'include',
      ...options,
      headers
    });

    const raw = await response.text();
    let data = null;

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }

    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && (data.error || data.detail)) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  const api = {
    baseUrl,
    signup(payload) {
      return request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    login(payload) {
      return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    logout() {
      return request('/api/auth/logout', { method: 'POST' });
    },
    me() {
      return request('/api/auth/me', { method: 'GET' });
    },
    listCourses() {
      return request('/api/courses', { method: 'GET' });
    },
    paymentSettings() {
      return request('/api/payment/settings', { method: 'GET' });
    },
    myPurchases() {
      return request('/api/courses/purchases/me', { method: 'GET' });
    },
    courseAccess(courseId) {
      return request(`/api/courses/${encodeURIComponent(courseId)}/access`, { method: 'GET' });
    },
    purchaseCourse(courseId, payload = {}) {
      return request(`/api/courses/${encodeURIComponent(courseId)}/purchase`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    createPaymentRequest(courseId, payload = {}) {
      return request(`/api/courses/${encodeURIComponent(courseId)}/purchase`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    notifyTelegramCode(payload) {
      return request('/api/notifications/telegram-code', {
        method: 'POST',
        body: JSON.stringify(payload || {})
      });
    },
    adminListUsers(query) {
      const qs = query ? `?query=${encodeURIComponent(query)}` : '';
      return request(`/api/admin/users${qs}`, { method: 'GET' });
    },
    adminListGrants() {
      return request('/api/admin/grants', { method: 'GET' });
    },
    adminCreateGrant(payload) {
      return request('/api/admin/grants', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    adminDeleteGrant(grantId) {
      return request(`/api/admin/grants/${encodeURIComponent(grantId)}`, {
        method: 'DELETE'
      });
    },
    adminListPurchases() {
      return request('/api/admin/purchases', { method: 'GET' });
    },
    adminListPaymentRequests() {
      return request('/api/admin/payment-requests', { method: 'GET' });
    },
    adminListAppointments() {
      return request('/api/admin/appointments', { method: 'GET' });
    },
    adminPaymentDecision(paymentRequestId, payload = {}) {
      return request(`/api/admin/payment-requests/${encodeURIComponent(paymentRequestId)}/decision`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  };

  windowObject.IntegratAuthApi = api;
})(window);
