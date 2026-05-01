(function contactForms(windowObject, documentObject) {
  const i18n = windowObject.IntegratI18n;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
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

  function resetPhoneInput(phoneInput) {
    if (!phoneInput) return;
    phoneInput.value = '+7';
  }

  function bindPhoneMask(phoneInput) {
    if (!phoneInput || phoneInput.dataset.phoneMaskBound === 'true') return;

    phoneInput.dataset.phoneMaskBound = 'true';
    phoneInput.placeholder = '+7 (___) ___ __ - __';
    phoneInput.inputMode = 'numeric';
    phoneInput.maxLength = 20;

    phoneInput.addEventListener('focus', () => {
      if (!normalizePhoneDigits(phoneInput.value)) {
        resetPhoneInput(phoneInput);
      }
    });

    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(normalizePhoneDigits(phoneInput.value));
    });

    if (normalizePhoneDigits(phoneInput.value)) {
      phoneInput.value = formatPhone(normalizePhoneDigits(phoneInput.value));
    } else {
      resetPhoneInput(phoneInput);
    }
  }

  function getStatusNode(form) {
    let node = form.querySelector('[data-form-status]');
    if (node) return node;

    node = documentObject.createElement('p');
    node.className = 'form-status';
    node.setAttribute('data-form-status', '');
    node.setAttribute('aria-live', 'polite');
    form.appendChild(node);
    return node;
  }

  function setStatus(form, message, options = {}) {
    const node = getStatusNode(form);
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(options.isError));
    node.classList.toggle('is-success', Boolean(options.isSuccess));
  }

  function setupForm(form) {
    const phoneInput = form.querySelector('input[type="tel"]');
    const agreeInput = form.querySelector('input[name="agree"], input[type="checkbox"]');
    const submitButton = form.querySelector('button[type="submit"]');

    bindPhoneMask(phoneInput);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.querySelector('[name="fullname"]')?.value.trim() || '';
      const comment = form.querySelector('[name="comment"]')?.value.trim() || '';
      const localDigits = normalizePhoneDigits(phoneInput?.value || '');
      const agree = agreeInput ? agreeInput.checked : true;

      if (!name || name.length < 2 || !comment || comment.length < 5 || localDigits.length !== 10 || !agree) {
        setStatus(form, t('form_invalid', 'Please complete the form correctly before submitting.'), { isError: true });
        return;
      }

      if (!windowObject.api) {
        setStatus(
          form,
          t('form_api_missing', 'Clinic API is not configured yet. Update the frontend runtime config first.'),
          { isError: true }
        );
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setStatus(form, t('form_sending', 'Sending your request...'));

      try {
        const response = await windowObject.api.post('/contacts', {
          fullname: name,
          phone: `7${localDigits}`,
          comment
        });

        form.reset();
        resetPhoneInput(phoneInput);
        const suffix = response?.telegram?.configured
          ? i18n?.isRussian?.()
            ? ' Уведомление отправлено в Telegram.'
            : ' Telegram notification sent.'
          : i18n?.isRussian?.()
            ? ' Telegram API пока не настроен.'
            : ' Telegram API not configured yet.';
        setStatus(
          form,
          `${t('form_success', 'Request sent. The Integrat team will contact you shortly.')}${suffix}`,
          { isSuccess: true }
        );

        const modal = form.closest('[data-modal], .doctor-modal-overlay');
        if (modal) {
          windowObject.setTimeout(() => {
            modal.classList.remove('is-active', 'active');
            documentObject.body.style.overflow = '';
          }, 800);
        }
      } catch (error) {
        const rawMessage = String(error?.message || '');
        const networkError = /failed to fetch|networkerror|load failed/i.test(rawMessage);
        const fallbackMessage = networkError
          ? t(
              'contact_network_error',
              'Cannot reach backend API. Start backend on http://localhost:3000 and retry.'
            )
          : t('contact_request_failed', 'Failed to send the request.');
        setStatus(form, networkError ? fallbackMessage : (rawMessage || fallbackMessage), { isError: true });
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function initAllForms() {
    documentObject.querySelectorAll('.contact-form, #contactForm').forEach(setupForm);
  }

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', initAllForms);
  } else {
    initAllForms();
  }
})(window, document);
