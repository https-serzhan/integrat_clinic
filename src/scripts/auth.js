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
    if (!raw) return 'doctors.html#clientDashboard';
    if (/^(https?:)?\/\//i.test(raw)) return 'doctors.html#clientDashboard';
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

  function normalizePhoneDigits(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  }

  function formatPhone(localDigits) {
    let formatted = '+7';
    if (localDigits.length > 0) formatted += ` (${localDigits.slice(0, 3)}`;
    if (localDigits.length >= 3) formatted += ')';
    if (localDigits.length > 3) formatted += ` ${localDigits.slice(3, 6)}`;
    if (localDigits.length > 6) formatted += ` ${localDigits.slice(6, 8)}`;
    if (localDigits.length > 8) formatted += ` - ${localDigits.slice(8, 10)}`;
    return formatted;
  }

  function setupPhoneMask(phoneInput) {
    if (!phoneInput || phoneInput.dataset?.phoneMaskBound === 'true') return;
    if (phoneInput.dataset) phoneInput.dataset.phoneMaskBound = 'true';
    phoneInput.placeholder = '+7 (___) ___ __ - __';
    phoneInput.inputMode = 'numeric';
    phoneInput.maxLength = 20;

    phoneInput.addEventListener('focus', () => {
      if (!normalizePhoneDigits(phoneInput.value)) {
        phoneInput.value = '+7';
      }
    });

    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(normalizePhoneDigits(phoneInput.value));
    });

    phoneInput.value = normalizePhoneDigits(phoneInput.value)
      ? formatPhone(normalizePhoneDigits(phoneInput.value))
      : '+7';
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

  function fieldValue(form, fieldName) {
    const directField = form[fieldName];
    if (directField && typeof directField === 'object' && 'value' in directField) {
      return String(directField.value || '');
    }

    const node = form.querySelector?.(`[name="${fieldName}"]`);
    return String(node?.value || '');
  }

  function redirectAfterAuth() {
    windowObject.location.href = getReturnTarget();
  }

  setupPhoneMask(registerForm.querySelector?.('[name="phone"]') || registerForm.phone);

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

    const name = fieldValue(registerForm, 'name').trim();
    const localPhoneDigits = normalizePhoneDigits(fieldValue(registerForm, 'phone'));
    const phone = `7${localPhoneDigits}`;
    const email = fieldValue(registerForm, 'email').trim();
    const password = fieldValue(registerForm, 'password');
    const confirmPassword = fieldValue(registerForm, 'confirmPassword');

    if (!name || name.length < 2 || !validEmail(email) || localPhoneDigits.length !== 10) {
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
      await windowObject.api.post('/auth/register', {
        name,
        phone,
        email,
        password
      });
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
