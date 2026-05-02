(function doctorCasePage(windowObject, documentObject) {
  const i18n = windowObject.IntegratI18n;
  const siteData = windowObject.IntegratSiteData || {};

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

  function splitEducation(doctor) {
    return String(doctor.education || doctor.education_ru || '')
      .split(/<br\s*\/?>/i)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  function splitFocus(doctor) {
    return String(doctor.spec || doctor.spec_ru || doctor.specialty || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  function renderList(node, items) {
    if (!node) return;
    node.innerHTML = items.map((item) => `<p>${item}</p>`).join('');
  }

  function setBookingStatus(node, message, options = {}) {
    if (!node) return;
    node.textContent = message || '';
    node.classList?.toggle?.('is-error', Boolean(options.isError));
    node.classList?.toggle?.('is-success', Boolean(options.isSuccess));
  }

  function buildClinicAuthReturnTo(doctorId) {
    return `doctor.html?doctor=${encodeURIComponent(String(doctorId || ''))}`;
  }

  function redirectToClinicAuth(doctorId) {
    windowObject.location.href = `auth.html?returnTo=${encodeURIComponent(buildClinicAuthReturnTo(doctorId))}`;
  }

  function isUnauthorizedBookingError(error) {
    const message = String(error?.message || '').toLowerCase();
    return error?.status === 401 || /unauthorized|validate credentials|log in|login|auth/.test(message);
  }

  function ensureBookingNodes(container, bookingButton) {
    let dateInput = documentObject.querySelector('.doctor-case-booking__input');
    let statusNode = documentObject.querySelector('.doctor-case-booking__status');

    if (dateInput && statusNode) {
      return { dateInput, statusNode };
    }

    if (!container || !bookingButton || typeof documentObject.createElement !== 'function') {
      return { dateInput, statusNode };
    }

    const booking = documentObject.createElement('div');
    booking.className = 'doctor-case-booking';
    booking.innerHTML = `
      <label class="doctor-case-booking__label" for="doctorCaseBookingDatetime">${t('doctor_booking_label', 'Preferred appointment time')}</label>
      <input id="doctorCaseBookingDatetime" class="doctor-case-booking__input" type="datetime-local" step="1800" />
      <p class="doctor-case-booking__status" aria-live="polite"></p>
    `;

    container.insertBefore(booking, bookingButton);
    dateInput = booking.querySelector('.doctor-case-booking__input');
    statusNode = booking.querySelector('.doctor-case-booking__status');

    return { dateInput, statusNode };
  }

  function setupSlider() {
    const slides = Array.from(documentObject.querySelectorAll('.slide'));
    const nextButton = documentObject.querySelector('.next');
    const prevButton = documentObject.querySelector('.prev');
    const slider = documentObject.querySelector('.doctor-slider');
    if (!slides.length || !nextButton || !prevButton || !slider) return;

    let currentIndex = 0;
    let autoplayId = null;

    function showSlide(index) {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    }

    function startAutoplay() {
      if (autoplayId) windowObject.clearInterval?.(autoplayId);
      autoplayId = windowObject.setInterval?.(nextSlide, 4000);
    }

    function stopAutoplay() {
      if (autoplayId) {
        windowObject.clearInterval?.(autoplayId);
        autoplayId = null;
      }
    }

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    slider.addEventListener?.('mouseenter', stopAutoplay);
    slider.addEventListener?.('mouseleave', startAutoplay);

    showSlide(currentIndex);
    startAutoplay();
  }

  function setupDoctorCasePage() {
    const doctorSection = documentObject.querySelector('.doctor-section');
    const infoPanel = documentObject.querySelector('.doctor-info');
    const titleNode = documentObject.querySelector('.doctor-info h2');
    const descriptionNode = documentObject.querySelector('.doctor-description');
    const tenureNode = documentObject.querySelector('.doctor-service strong');
    const specialtiesLeft = documentObject.querySelector('.doctor-specialties > div:first-child');
    const specialtiesRight = documentObject.querySelector('.doctor-specialties > div:last-child');
    const bookingButton = documentObject.querySelector('.doctor-btn');
    const doctors = Array.isArray(siteData.doctors) ? siteData.doctors : [];
    const SearchParams = windowObject.URLSearchParams || URLSearchParams;
    const params = new SearchParams(windowObject.location.search || '');
    const doctorId = Number(params.get('doctor'));
    const doctor = doctors.find((item) => Number(item.id) === doctorId) || doctors[0] || null;

    if (doctorSection && doctor?.id) {
      doctorSection.dataset.doctorId = String(doctor.id);
    }

    if (doctor) {
      if (titleNode) titleNode.textContent = doctor.name || t('doctor_name_fallback', 'Integrat doctor');
      if (descriptionNode) {
        descriptionNode.textContent = doctor.spec || doctor.spec_ru || doctor.specialty || '';
      }
      if (tenureNode) {
        tenureNode.textContent = format('doctor_experience_short', { years: doctor.experience || 0 }, `${doctor.experience || 0} years`);
      }
      renderList(specialtiesLeft, splitEducation(doctor));
      renderList(specialtiesRight, splitFocus(doctor));
      if (typeof documentObject.title === 'string') {
        documentObject.title = `${doctor.name} | Integrat`;
      }
    }

    const bookingNodes = ensureBookingNodes(infoPanel, bookingButton);
    const dateInput = bookingNodes.dateInput;
    const statusNode = bookingNodes.statusNode;

    if (dateInput && !dateInput.value) {
      dateInput.value = nextSuggestedSlot();
    }

    bookingButton?.addEventListener('click', async () => {
      if (!doctor?.id) {
        setBookingStatus(statusNode, t('doctor_incomplete', 'Doctor information is incomplete.'), { isError: true });
        return;
      }

      if (!windowObject.localStorage?.getItem('token')) {
        redirectToClinicAuth(doctor.id);
        return;
      }

      if (!dateInput?.value) {
        setBookingStatus(statusNode, t('appointment_pick_time', 'Select a preferred appointment time before continuing.'), {
          isError: true
        });
        return;
      }

      if (!windowObject.api?.post) {
        setBookingStatus(statusNode, t('doctor_api_missing', 'Clinic API is not configured yet.'), { isError: true });
        return;
      }

      bookingButton.disabled = true;
      setBookingStatus(statusNode, t('appointment_submitting', 'Submitting appointment request...'));

      try {
        await windowObject.api.post('/appointments', {
          doctor_id: doctor.id,
          datetime: toBookingIsoString(dateInput.value)
        });
        setBookingStatus(statusNode, t('appointment_success', 'Appointment request submitted successfully.'), {
          isSuccess: true
        });
      } catch (error) {
        if (isUnauthorizedBookingError(error)) {
          try {
            windowObject.localStorage.removeItem('token');
          } catch {}
          setBookingStatus(statusNode, t('appointment_no_auth', 'Please log in before booking an appointment.'), {
            isError: true
          });
          windowObject.setTimeout(() => redirectToClinicAuth(doctor.id), 250);
          return;
        }
        setBookingStatus(statusNode, error.message || t('appointment_error', 'Failed to create appointment.'), {
          isError: true
        });
      } finally {
        bookingButton.disabled = false;
      }
    });

    setupSlider();
  }

  setupDoctorCasePage();
})(window, document);
