(function doctorModal(windowObject, documentObject) {
  const i18n = windowObject.IntegratI18n;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function format(key, values, fallback) {
    return i18n?.format ? i18n.format(key, values, fallback) : fallback;
  }

  function formatLocalDateTime(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function nextSuggestedSlot() {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(10, 0, 0, 0);
    return formatLocalDateTime(next);
  }

  function toBookingIsoString(value) {
    const normalized = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
      return `${normalized}:00.000Z`;
    }
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }

  function buildBookingForm(modal) {
    const container = modal.querySelector('.doctor-modal-body');
    if (!container || modal.querySelector('.doctor-booking')) return;

    const booking = documentObject.createElement('div');
    booking.className = 'doctor-booking';
    booking.innerHTML = `
      <div class="doctor-booking__row">
        <div class="doctor-booking__field">
          <label for="doctorBookingDatetime">${t('doctor_booking_label', 'Preferred appointment time')}</label>
          <input id="doctorBookingDatetime" class="doctor-booking__input" type="datetime-local" step="1800" />
        </div>
      </div>
      <p class="form-status doctor-booking__status" data-booking-status aria-live="polite"></p>
    `;

    container.appendChild(booking);
  }

  function parseCases(raw, fallbackImage) {
    const values = String(raw || '')
      .split('||')
      .map((item) => item.trim())
      .filter(Boolean);
    return values.length ? values : [fallbackImage || '../../assets/images/orange-doctor.png'];
  }

  function setBookingStatus(modal, message, options = {}) {
    const node = modal.querySelector('[data-booking-status]');
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(options.isError));
    node.classList.toggle('is-success', Boolean(options.isSuccess));
  }

  function currentReturnTo() {
    return `${windowObject.location.pathname.split('/').pop() || 'doctors.html'}${windowObject.location.search || ''}`;
  }

  function redirectToClinicAuth() {
    windowObject.location.href = `auth.html?returnTo=${encodeURIComponent(currentReturnTo())}`;
  }

  function isUnauthorizedBookingError(error) {
    const message = String(error?.message || '').toLowerCase();
    return error?.status === 401 || /unauthorized|validate credentials|log in|login|auth/.test(message);
  }

  function setupDoctorModal() {
    const modal = documentObject.getElementById('doctorModal');
    if (!modal) return;

    const closeButton = modal.querySelector('.doctor-modal-close');
    const nameEl = modal.querySelector('.doctor-name');
    const roleEl = modal.querySelector('.doctor-role');
    const expEl = modal.querySelector('.doctor-exp');
    const textEl = modal.querySelector('.doctor-text');
    const imageNodes = modal.querySelectorAll('.doctor-modal-img, .doctor-photo');
    const actionButtons = Array.from(modal.querySelectorAll('.doctor-actions .btn-black'));
    const detailsButton = actionButtons.find((button) => /cases/i.test(button.textContent));
    const bookButton = actionButtons.find((button) => /запис|book/i.test(button.textContent));

    buildBookingForm(modal);
    const dateInput = modal.querySelector('.doctor-booking__input');

    function openModal(data) {
      if (nameEl) nameEl.textContent = data.name || t('doctor_name_fallback', 'Integrat doctor');
      if (roleEl) roleEl.textContent = data.role || data.specialty || t('doctor_specialist_fallback', 'Dental specialist');
      if (expEl) {
        expEl.textContent = format('doctor_experience', { years: data.exp || 10 }, `Experience: ${data.exp || 10} years`);
      }
      if (textEl) {
        textEl.innerHTML = `
          <p><strong>${t('doctor_education_label', 'Education:')}</strong><br>${data.edu || t('doctor_education_fallback', 'Education profile will be published soon.')}</p>
          <p><strong>${t('doctor_focus_label', 'Focus:')}</strong><br>${data.spec || data.specialty || t('doctor_focus_fallback', 'Comprehensive dental treatment.')}</p>
        `;
      }

      const caseImages = parseCases(data.cases, data.img);
      imageNodes.forEach((node, index) => {
        const url = caseImages[index % caseImages.length] || data.img || '../../assets/images/orange-doctor.png';
        if (node.tagName === 'IMG') {
          node.src = url;
          node.alt = `${data.name || 'Doctor'} case ${index + 1}`;
        } else {
          node.style.backgroundImage = `url(${url})`;
          node.style.backgroundSize = 'cover';
          node.style.backgroundPosition = 'center';
        }
      });

      modal.dataset.doctorId = data.id || '';
      if (dateInput) dateInput.value = nextSuggestedSlot();
      setBookingStatus(modal, '');
      modal.classList.add('active');
      documentObject.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      documentObject.body.style.overflow = '';
      setBookingStatus(modal, '');
    }

    documentObject.addEventListener('click', (event) => {
      const card = event.target.closest('.doctor-card');
      if (!card) return;

      openModal({
        id: card.dataset.id,
        name: card.dataset.name,
        role: card.dataset.role,
        exp: card.dataset.exp,
        edu: card.dataset.edu,
        spec: card.dataset.spec,
        img: card.dataset.img,
        cases: card.dataset.cases,
        specialty: card.dataset.specialty
      });
    });

    closeButton?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    documentObject.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });

    detailsButton?.addEventListener('click', () => {
      const doctorId = String(modal.dataset.doctorId || '').trim();
      windowObject.location.href = doctorId ? `doctor.html?doctor=${encodeURIComponent(doctorId)}` : 'doctor.html';
    });

    if (bookButton) {
      bookButton.type = 'button';
      bookButton.addEventListener('click', async () => {
        const doctorId = Number(modal.dataset.doctorId || 0);
        if (!doctorId) {
          setBookingStatus(modal, t('doctor_incomplete', 'Doctor information is incomplete.'), { isError: true });
          return;
        }

        if (!dateInput?.value) {
          setBookingStatus(
            modal,
            t('appointment_pick_time', 'Select a preferred appointment time before continuing.'),
            { isError: true }
          );
          return;
        }

        if (!windowObject.api) {
          setBookingStatus(modal, t('doctor_api_missing', 'Clinic API is not configured yet.'), { isError: true });
          return;
        }

        bookButton.disabled = true;
        setBookingStatus(modal, t('appointment_submitting', 'Submitting appointment request...'));

        try {
          const response = await windowObject.api.post('/appointments', {
            doctor_id: doctorId,
            datetime: toBookingIsoString(dateInput.value)
          });
          const suffix = response?.telegram?.configured
            ? i18n?.isRussian?.()
              ? ' Код отправлен в Telegram.'
              : ' Telegram code sent.'
            : '';
          setBookingStatus(
            modal,
            `${t('appointment_success', 'Appointment request submitted successfully.')}${suffix}`,
            { isSuccess: true }
          );
          windowObject.setTimeout(closeModal, 900);
        } catch (error) {
          if (isUnauthorizedBookingError(error)) {
            try {
              windowObject.localStorage.removeItem('token');
            } catch {}
            setBookingStatus(
              modal,
              t('appointment_no_auth', 'Please log in before booking an appointment.'),
              { isError: true }
            );
            windowObject.setTimeout(redirectToClinicAuth, 250);
            return;
          }
          setBookingStatus(
            modal,
            error.message || t('appointment_error', 'Failed to create appointment.'),
            { isError: true }
          );
        } finally {
          bookButton.disabled = false;
        }
      });
    }
  }

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', setupDoctorModal);
  } else {
    setupDoctorModal();
  }
})(window, document);
