(function academyAuthBootstrap() {
  const api = window.IntegratAuthApi;
  if (!api) return;

  const authButton = document.getElementById('academyAuthButton');
  const modal = document.getElementById('academyAuthModal');
  const closeButtons = modal ? modal.querySelectorAll('[data-auth-close]') : [];
  const tabs = modal ? modal.querySelectorAll('[data-auth-tab]') : [];
  const forms = modal ? modal.querySelectorAll('[data-auth-form]') : [];
  const feedback = document.getElementById('academyAuthFeedback');

  let currentUser = null;

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
      return;
    }

    authButton.textContent = 'LOGOUT';
    authButton.dataset.action = 'logout';
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
      form.hidden = form.dataset.authForm !== mode;
    });

    setFeedback('');
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
    });
  }

  const signupForm = document.getElementById('academySignupForm');
  const loginForm = document.getElementById('academyLoginForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);

      try {
        const response = await api.signup({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password')
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

      try {
        const response = await api.login({
          email: formData.get('email'),
          password: formData.get('password')
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
  }

  boot();
})();
