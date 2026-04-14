(function attachAuthApi(windowObject) {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  async function request(path, options) {
    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options && options.headers ? options.headers : {}),
        ...(options && options.body ? jsonHeaders : {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  const api = {
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
    courseAccess(courseId) {
      return request(`/api/courses/${encodeURIComponent(courseId)}/access`, { method: 'GET' });
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
    }
  };

  windowObject.IntegratAuthApi = api;
})(window);
