(function academyAuthBootstrap() {
  const api = window.IntegratAuthApi;
  if (!api) return;
  const i18n = window.IntegratI18n;

  const authButton = document.getElementById('academyAuthButton');
  const adminLink = document.getElementById('academyAdminLink');
  const modal = document.getElementById('academyAuthModal');
  const closeButtons = modal ? modal.querySelectorAll('[data-auth-close]') : [];
  const tabs = modal ? modal.querySelectorAll('[data-auth-tab]') : [];
  const forms = modal ? modal.querySelectorAll('[data-auth-form]') : [];
  const feedback = document.getElementById('academyAuthFeedback');

  let currentUser = null;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function normalizePhoneDigits(value) {
    let digits = normalizePhone(value);
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

  function syncPhoneMask(phoneInput) {
    if (!phoneInput) return;
    phoneInput.value = formatPhone(normalizePhoneDigits(phoneInput.value));
  }

  function setupPhoneMask(phoneInput) {
    if (!phoneInput || phoneInput.dataset.phoneMaskBound === 'true') return;

    phoneInput.dataset.phoneMaskBound = 'true';
    phoneInput.placeholder = '+7 (___) ___ __ - __';
    phoneInput.inputMode = 'numeric';
    phoneInput.maxLength = 20;

    phoneInput.addEventListener('focus', () => {
      if (!normalizePhoneDigits(phoneInput.value)) {
        phoneInput.value = '+7';
      }
    });

    phoneInput.addEventListener('input', () => {
      syncPhoneMask(phoneInput);
    });

    if (normalizePhoneDigits(phoneInput.value)) {
      syncPhoneMask(phoneInput);
    } else {
      phoneInput.value = '+7';
    }
  }

  function setFormState(form, isActive) {
    if (!form) return;
    form.hidden = !isActive;
    form.setAttribute('aria-hidden', String(!isActive));

    form.querySelectorAll('input, button, select, textarea').forEach((field) => {
      field.disabled = !isActive;
    });
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

  function setFeedback(message, isError) {
    if (!feedback) return;
    feedback.textContent = message || '';
    feedback.classList.toggle('is-error', Boolean(isError));
  }

  function setUserUI(user) {
    currentUser = user || null;

    if (!authButton) return;

    if (!currentUser) {
      authButton.textContent = 'LOGIN';
      authButton.dataset.action = 'open';
      if (adminLink) adminLink.hidden = true;
      window.IntegratI18n?.applyDomTranslations?.();
      document.dispatchEvent(
        new CustomEvent('integrat:academy-user', {
          detail: { user: null }
        })
      );
      return;
    }

    authButton.textContent = 'LOGOUT';
    authButton.dataset.action = 'logout';
    if (adminLink) {
      adminLink.hidden = currentUser.role !== 'admin';
    }
    window.IntegratI18n?.applyDomTranslations?.();
    document.dispatchEvent(
      new CustomEvent('integrat:academy-user', {
        detail: { user: currentUser }
      })
    );
  }

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('auth-modal-open');
    setFeedback('');
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('auth-modal-open');
  }

  function switchTab(mode) {
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.authTab === mode);
    });

    forms.forEach((form) => {
      setFormState(form, form.dataset.authForm === mode);
    });

    setFeedback('');
    const activeForm = Array.from(forms).find((form) => form.dataset.authForm === mode);
    activeForm?.querySelector('input')?.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.authTab));
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  if (authButton) {
    authButton.addEventListener('click', async () => {
      const action = authButton.dataset.action || 'open';

      if (action === 'logout') {
        try {
          await api.logout();
          setUserUI(null);
        } catch (error) {
          setFeedback(error.message, true);
        }
        return;
      }

      openModal();
      switchTab('login');
    });
  }

  const signupForm = document.getElementById('academySignupForm');
  const loginForm = document.getElementById('academyLoginForm');
  const signupPhoneInput = signupForm?.querySelector('input[name="phone"]');

  setupPhoneMask(signupPhoneInput);
  setFormState(loginForm, true);
  setFormState(signupForm, false);

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const name = String(formData.get('name') || '').trim();
      const localPhoneDigits = normalizePhoneDigits(formData.get('phone') || '');
      const phone = `7${localPhoneDigits}`;
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');

      if (!name || !validEmail(email)) {
        setFeedback(t('form_invalid', 'Please complete the form correctly before submitting.'), true);
        return;
      }

      if (localPhoneDigits.length !== 10) {
        setFeedback(t('form_invalid', 'Please complete the form correctly before submitting.'), true);
        return;
      }

      if (password !== confirmPassword) {
        setFeedback(t('auth_password_mismatch', 'Passwords do not match.'), true);
        return;
      }

      if (!strongPassword(password)) {
        setFeedback(
          t(
            'auth_password_weak',
            'Use at least 8 characters with uppercase, lowercase, number, and symbol.'
          ),
          true
        );
        return;
      }

      try {
        const response = await api.signup({
          name,
          phone,
          email,
          password
        });
        setUserUI(response.user);
        closeModal();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');

      if (!validEmail(email) || !password) {
        setFeedback(t('form_invalid', 'Please complete the form correctly before submitting.'), true);
        return;
      }

      try {
        const response = await api.login({
          email,
          password
        });
        setUserUI(response.user);
        closeModal();
      } catch (error) {
        setFeedback(error.message, true);
      }
    });
  }

  async function boot() {
    try {
      const response = await api.me();
      setUserUI(response.user);
    } catch {
      setUserUI(null);
    }

    if (!currentUser && window.location.pathname.endsWith('/academy.html')) {
      openModal();
      switchTab('login');
    }
  }

  boot();
})();
