(function doctorsPage(windowObject, documentObject) {
  const grid = documentObject.querySelector('.doctors-grid');
  if (!grid) return;

  const i18n = windowObject.IntegratI18n;
  const siteData = windowObject.IntegratSiteData || {};
  const fallbackDoctors = Array.isArray(siteData.doctors) ? siteData.doctors : [];
  const filtersContainer = documentObject.querySelector('.doctors-filters');
  let sourceDoctors = fallbackDoctors;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function localizedValue(entry, key, fallback = '') {
    if (!entry) return fallback;
    if (i18n?.isRussian?.()) {
      return entry[`${key}_ru`] || entry[key] || fallback;
    }
    return entry[key] || fallback;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function findMetadata(doctor, index) {
    return (
      fallbackDoctors.find((item) => item.id === doctor.id) ||
      fallbackDoctors.find((item) => item.name.toLowerCase() === String(doctor.name || '').toLowerCase()) ||
      fallbackDoctors[index] ||
      {}
    );
  }

  function normalizeDoctor(doctor, index) {
    const meta = findMetadata(doctor, index);
    const specialty = doctor.specialty || meta.specialty || t('doctor_specialist_fallback', 'Dental specialist');
    const image = [doctor.image, meta.image].find((value) => {
      return value && !/\/(?:blue|orange)-doctor\.png$/i.test(String(value));
    }) || doctor.image || meta.image || '../../assets/images/orange-doctor.png';
    const categories =
      Array.isArray(doctor.categories) && doctor.categories.length
        ? doctor.categories
        : Array.isArray(meta.categories) && meta.categories.length
          ? meta.categories
          : [slugify(specialty) || 'all'];

    return {
      id: doctor.id || meta.id || index + 1,
      name: doctor.name || meta.name || `${t('doctor_name_fallback', 'Integrat doctor')} ${index + 1}`,
      specialty,
      specialty_ru: doctor.specialty_ru || meta.specialty_ru || specialty,
      categories,
      image,
      cases:
        Array.isArray(doctor.cases) && doctor.cases.length
          ? doctor.cases
          : Array.isArray(meta.cases) && meta.cases.length
            ? meta.cases
            : [image],
      experience: doctor.experience || meta.experience || 10,
      education: doctor.education || meta.education || t('doctor_education_fallback', 'Education profile will be published soon.'),
      education_ru: doctor.education_ru || meta.education_ru || doctor.education || meta.education || t('doctor_education_fallback', 'Education profile will be published soon.'),
      spec: doctor.spec || meta.spec || specialty,
      spec_ru: doctor.spec_ru || meta.spec_ru || doctor.spec || meta.spec || localizedValue(meta, 'specialty', specialty)
    };
  }

  function titleCase(value) {
    return String(value || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function renderFilterButtons(doctors) {
    if (!filtersContainer) return;
    const categories = ['all', ...new Set(doctors.flatMap((doctor) => doctor.categories).filter(Boolean))];
    const active = documentObject.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    filtersContainer.innerHTML = categories
      .map(
        (category) => `
          <button class="filter-btn ${category === active ? 'active' : ''}" data-filter="${escapeHtml(category)}">
            ${escapeHtml(category === 'all' ? t('all', 'All') : titleCase(category))}
          </button>
        `
      )
      .join('');
  }

  function renderDoctors(doctors) {
    if (!doctors.length) {
      grid.innerHTML = `<div class="content-state">${escapeHtml(
        t('doctors_empty', 'Profiles will be added soon.')
      )}</div>`;
      return;
    }

    renderFilterButtons(doctors);
    grid.innerHTML = doctors.map((doctor) => {
      const localizedDoctor = {
        ...doctor,
        specialty: localizedValue(doctor, 'specialty', doctor.specialty),
        education: localizedValue(doctor, 'education', doctor.education),
        spec: localizedValue(doctor, 'spec', doctor.spec)
      };

      return `
      <article class="doctor-card"
        data-id="${escapeHtml(localizedDoctor.id)}"
        data-name="${escapeHtml(localizedDoctor.name)}"
        data-role="${escapeHtml(localizedDoctor.specialty)}"
        data-specialty="${escapeHtml(localizedDoctor.specialty)}"
        data-exp="${escapeHtml(localizedDoctor.experience)}"
        data-edu="${escapeHtml(localizedDoctor.education)}"
        data-spec="${escapeHtml(localizedDoctor.spec)}"
        data-img="${escapeHtml(localizedDoctor.image)}"
        data-cases="${escapeHtml(localizedDoctor.cases.join('||'))}"
        data-category="${escapeHtml(localizedDoctor.categories.join(' '))}">
        <div class="doctor-photo">
          <img src="${escapeHtml(localizedDoctor.image)}" alt="${escapeHtml(localizedDoctor.name)}" />
        </div>
        <h4>${escapeHtml(localizedDoctor.name)}</h4>
        <p>${escapeHtml(localizedDoctor.specialty)}</p>
      </article>
    `;
    }).join('');
  }

  function renderSkeletonDoctors() {
    grid.innerHTML = Array.from({ length: 4 }).map(() => `
      <article class="doctor-card doctor-card--skeleton" aria-hidden="true">
        <div class="doctor-photo skeleton-box"></div>
        <div class="skeleton-line skeleton-line--md"></div>
        <div class="skeleton-line skeleton-line--sm"></div>
      </article>
    `).join('');
  }

  function applyFilter(filter) {
    documentObject.querySelectorAll('.doctor-card').forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
      card.style.display = filter === 'all' || categories.includes(filter) ? 'block' : 'none';
    });
  }

  function setupFilters() {
    documentObject.addEventListener('click', (event) => {
      const doctorFilter = event.target.closest('.filter-btn');
      if (doctorFilter) {
        const filter = doctorFilter.dataset.filter || 'all';
        documentObject.querySelectorAll('.filter-btn').forEach((button) => button.classList.remove('active'));
        doctorFilter.classList.add('active');
        applyFilter(filter);
      }

      const treatmentFilter = event.target.closest('.treatment-filter');
      if (treatmentFilter) {
        const filter = treatmentFilter.dataset.filter || 'all';
        documentObject.querySelectorAll('.treatment-filter').forEach((button) => button.classList.remove('active'));
        treatmentFilter.classList.add('active');
        documentObject.querySelectorAll('.treatment-card').forEach((card) => {
          const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
          card.style.display = filter === 'all' || categories.includes(filter) ? '' : 'none';
        });
      }

      const treatmentItem = event.target.closest('.treatment-list-item');
      if (treatmentItem) {
        treatmentItem.classList.toggle('active');
        const symbol = treatmentItem.querySelector('span');
        if (symbol) {
          symbol.textContent = treatmentItem.classList.contains('active') ? '−' : '+';
        }
      }
    });
  }

  async function loadDoctors() {
    renderSkeletonDoctors();
    sourceDoctors = fallbackDoctors.map(normalizeDoctor);
    renderDoctors(sourceDoctors);
    applyFilter(documentObject.querySelector('.filter-btn.active')?.dataset.filter || 'all');

    if (!windowObject.api) return;

    try {
      const doctors = await windowObject.api.get('/doctors');
      if (Array.isArray(doctors) && doctors.length) {
        sourceDoctors = doctors.map(normalizeDoctor);
        renderDoctors(sourceDoctors);
        applyFilter(documentObject.querySelector('.filter-btn.active')?.dataset.filter || 'all');
      }
    } catch (error) {
      console.warn('Failed to load doctors from backend:', error.message);
    }
  }

  setupFilters();
  documentObject.addEventListener('integrat:langchange', () => {
    renderDoctors(sourceDoctors);
    applyFilter(documentObject.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  });
  loadDoctors();
})(window, document);
