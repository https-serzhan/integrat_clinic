(function peopleGrid(windowObject, documentObject) {
  const siteData = windowObject.IntegratSiteData || {};
  const i18n = windowObject.IntegratI18n;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function localizedValue(entry, key, fallback) {
    if (!entry) return fallback || '';
    if (i18n?.isRussian?.()) {
      return entry[`${key}_ru`] || entry[key] || fallback || '';
    }
    return entry[key] || fallback || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function titleCase(value) {
    return String(value || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function normalizeEntry(entry, index) {
    const specialty = entry.specialty || t('doctor_specialist_fallback', 'Dental specialist');
    const categories = Array.isArray(entry.categories) && entry.categories.length ? entry.categories : ['all'];

    return {
      id: entry.id || index + 1,
      name: entry.name || `${t('doctor_name_fallback', 'Integrat doctor')} ${index + 1}`,
      specialty,
      specialty_ru: entry.specialty_ru || specialty,
      categories,
      image: entry.image || '../../assets/images/orange-doctor.png',
      experience: entry.experience || 10,
      education: entry.education || t('doctor_education_fallback', 'Education profile will be published soon.'),
      education_ru: entry.education_ru || entry.education || t('doctor_education_fallback', 'Education profile will be published soon.'),
      spec: entry.spec || specialty,
      spec_ru: entry.spec_ru || entry.spec || specialty
    };
  }

  function resolveEntries(sourceName) {
    const entries = siteData[sourceName];
    return Array.isArray(entries) ? entries.map(normalizeEntry) : [];
  }

  function cardMarkup(entry, tagName) {
    const localizedSpecialty = localizedValue(entry, 'specialty', entry.specialty);
    const localizedEducation = localizedValue(entry, 'education', entry.education);
    const localizedSpec = localizedValue(entry, 'spec', entry.spec);
    const tag = tagName || 'article';

    return `
      <${tag} class="doctor-card"
        data-id="${escapeHtml(entry.id)}"
        data-name="${escapeHtml(entry.name)}"
        data-role="${escapeHtml(localizedSpecialty)}"
        data-specialty="${escapeHtml(localizedSpecialty)}"
        data-exp="${escapeHtml(entry.experience)}"
        data-edu="${escapeHtml(localizedEducation)}"
        data-spec="${escapeHtml(localizedSpec)}"
        data-img="${escapeHtml(entry.image)}"
        data-category="${escapeHtml(entry.categories.join(' '))}">
        <div class="doctor-photo">
          <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.name)}" />
        </div>
        <h4>${escapeHtml(entry.name)}</h4>
        <p>${escapeHtml(localizedSpecialty)}</p>
      </${tag}>
    `;
  }

  function sliderMarkup(entry, index) {
    const localizedSpecialty = localizedValue(entry, 'specialty', entry.specialty);
    const localizedEducation = localizedValue(entry, 'education', entry.education);
    const localizedSpec = localizedValue(entry, 'spec', entry.spec);
    const tags = entry.categories.slice(0, 4).map((category) => `<span>${escapeHtml(titleCase(category))}</span>`).join('');

    return `
      <article class="doctor-slide doctor-card"
        data-id="${escapeHtml(entry.id)}"
        data-name="${escapeHtml(entry.name)}"
        data-role="${escapeHtml(localizedSpecialty)}"
        data-specialty="${escapeHtml(localizedSpecialty)}"
        data-exp="${escapeHtml(entry.experience)}"
        data-edu="${escapeHtml(localizedEducation)}"
        data-spec="${escapeHtml(localizedSpec)}"
        data-img="${escapeHtml(entry.image)}"
        data-category="${escapeHtml(entry.categories.join(' '))}">
        <div class="doctor-times">${tags}</div>
        <div class="doctor-info">
          <h4>${escapeHtml(entry.name)}</h4>
          <p>${escapeHtml(localizedSpecialty)}</p>
        </div>
        <button class="doctor-btn ${index === 0 ? '' : 'outline'}" type="button">
          ${escapeHtml(t('doctor_slider_more', 'More details'))}
          <span>›</span>
        </button>
      </article>
    `;
  }

  function renderFilters(container, entries, activeFilter) {
    if (!container) return;

    const categories = ['all', ...new Set(entries.flatMap((entry) => entry.categories).filter(Boolean))];
    container.innerHTML = categories
      .map(
        (category) => `
          <button class="filter-btn ${category === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">
            ${escapeHtml(category === 'all' ? t('all', 'All') : titleCase(category))}
          </button>
        `
      )
      .join('');
  }

  function renderGrid(grid) {
    const sourceName = String(grid.dataset.peopleGrid || '').trim();
    if (!sourceName) return;

    const entries = resolveEntries(sourceName);
    const limit = Number(grid.dataset.peopleLimit || 0);
    const requestedFilter = grid.dataset.activeFilter || 'all';
    const root = typeof grid.closest === 'function' ? grid.closest('[data-people-section]') : null;
    const filters = root?.querySelector?.('[data-people-filters]') || null;
    const effectiveFilter =
      requestedFilter === 'all' || entries.some((entry) => entry.categories.includes(requestedFilter))
        ? requestedFilter
        : 'all';

    grid.dataset.activeFilter = effectiveFilter;
    renderFilters(filters, entries, effectiveFilter);

    const filtered =
      effectiveFilter === 'all'
        ? entries
        : entries.filter((entry) => entry.categories.includes(effectiveFilter));
    const visible = limit > 0 ? filtered.slice(0, limit) : filtered;

    if (!visible.length) {
      grid.innerHTML = `<div class="content-state">${escapeHtml(t('doctors_empty', 'Profiles will be added soon.'))}</div>`;
      return;
    }

    grid.innerHTML = visible.map((entry) => cardMarkup(entry, 'article')).join('');
  }

  function renderTrack(track) {
    const sourceName = String(track.dataset.peopleTrack || '').trim();
    if (!sourceName) return;

    const limit = Number(track.dataset.peopleLimit || 0);
    const entries = resolveEntries(sourceName);
    const visible = limit > 0 ? entries.slice(0, limit) : entries;

    track.innerHTML = visible.map((entry) => cardMarkup(entry, 'div')).join('');
  }

  function renderSlider(track) {
    const sourceName = String(track.dataset.peopleSlider || '').trim();
    if (!sourceName) return;

    const limit = Number(track.dataset.peopleLimit || 0);
    const entries = resolveEntries(sourceName);
    const visible = limit > 0 ? entries.slice(0, limit) : entries;

    track.innerHTML = visible.map((entry, index) => sliderMarkup(entry, index)).join('');
  }

  function renderAll() {
    documentObject.querySelectorAll('[data-people-grid]').forEach((grid) => renderGrid(grid));
    documentObject.querySelectorAll('[data-people-track]').forEach((track) => renderTrack(track));
    documentObject.querySelectorAll('[data-people-slider]').forEach((track) => renderSlider(track));
  }

  documentObject.addEventListener('click', (event) => {
    const button = event.target.closest('[data-people-filters] .filter-btn');
    if (!button) return;

    const filters = button.closest('[data-people-filters]');
    const root = filters?.closest?.('[data-people-section]');
    const grid = root?.querySelector?.('[data-people-grid]');
    if (!grid) return;

    grid.dataset.activeFilter = button.dataset.filter || 'all';
    renderGrid(grid);
  });

  documentObject.addEventListener('integrat:langchange', renderAll);

  renderAll();
})(window, document);
