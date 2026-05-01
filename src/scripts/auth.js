(function authPage(windowObject, documentObject) {
  const i18n = windowObject.IntegratI18n;
  const tabs = documentObject.querySelectorAll('.auth-tab');
  const forms = documentObject.querySelectorAll('.auth-form');
  const loginForm = documentObject.getElementById('loginForm');
  const registerForm = documentObject.getElementById('registerForm');

  if (!loginForm || !registerForm || !windowObject.api) return;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function getReturnTarget() {
    const params = new URLSearchParams(windowObject.location.search);
    const raw = params.get('returnTo');
    if (!raw) return 'index.html';
    if (/^(https?:)?\/\//i.test(raw)) return 'index.html';
    return raw.startsWith('/') ? raw.slice(1) : raw;
  }

  function showError(id, message) {
    const errorNode = documentObject.getElementById(id);
    if (!errorNode) return;
    errorNode.textContent = message || '';
    errorNode.style.display = message ? 'block' : 'none';
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
  }

  function strongPassword(value) {
    const password = String(value || '');
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  function setSubmitting(form, pending) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = pending;
  }

  function redirectAfterAuth() {
    windowObject.location.href = getReturnTarget();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      forms.forEach((form) => {
        form.classList.toggle('active', form.id === `${target}Form`);
      });
      showError('loginError', '');
      showError('registerError', '');
    });
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showError('loginError', '');

    const email = String(loginForm.email.value || '').trim();
    const password = String(loginForm.password.value || '');

    if (!validEmail(email) || !password) {
      showError('loginError', t('form_invalid', 'Please complete the form correctly before submitting.'));
      return;
    }

    setSubmitting(loginForm, true);

    try {
      const data = await windowObject.api.post('/auth/login', {
        email,
        password
      });
      windowObject.localStorage.setItem('token', data.access_token);
      redirectAfterAuth();
    } catch (error) {
      showError('loginError', error.message || t('auth_login_failed', 'Login failed.'));
    } finally {
      setSubmitting(loginForm, false);
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showError('registerError', '');

    const email = String(registerForm.email.value || '').trim();
    const password = String(registerForm.password.value || '');
    const confirmPassword = String(registerForm.confirmPassword.value || '');

    if (!validEmail(email)) {
      showError('registerError', t('form_invalid', 'Please complete the form correctly before submitting.'));
      return;
    }

    if (password !== confirmPassword) {
      showError('registerError', t('auth_password_mismatch', 'Passwords do not match.'));
      return;
    }

    if (password.length < 8) {
      showError('registerError', t('auth_password_short', 'Password must be at least 8 characters.'));
      return;
    }

    if (!strongPassword(password)) {
      showError(
        'registerError',
        t('auth_password_weak', 'Use at least 8 characters with uppercase, lowercase, number, and symbol.')
      );
      return;
    }

    setSubmitting(registerForm, true);

    try {
      await windowObject.api.post('/auth/register', { email, password });
      const data = await windowObject.api.post('/auth/login', { email, password });
      windowObject.localStorage.setItem('token', data.access_token);
      redirectAfterAuth();
    } catch (error) {
      showError('registerError', error.message || t('auth_register_failed', 'Registration failed.'));
    } finally {
      setSubmitting(registerForm, false);
    }
  });
})(window, document);
