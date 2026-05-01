(function academyPage(windowObject, documentObject) {
  const grid = documentObject.querySelector('.academy-grid');
  const filtersContainer = documentObject.querySelector('.academy-filters');
  const moreButton = documentObject.querySelector('.academy-more__button');
  const currentPage = windowObject.location.pathname.split('/').pop() || 'academy.html';
  const isPrimaryAcademyPage = currentPage === 'academy.html';

  if (!grid) return;

  const i18n = windowObject.IntegratI18n;
  const siteData = windowObject.IntegratSiteData || {};
  const fallbackCourses = Array.isArray(siteData.academyCourses) ? siteData.academyCourses : [];
  const api = windowObject.IntegratAuthApi;
  let activeFilter = 'all';
  const initialVisibleCount = moreButton ? 6 : Number.MAX_SAFE_INTEGER;
  let visibleCount = initialVisibleCount;
  let carouselTimers = [];
  let renderedCourses = [];
  let currentUser = null;
  let purchasedCourseIds = new Set();
  let requestStatusByCourseId = new Map();
  let paymentSettings = null;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function localizedValue(entry, key, fallback = '') {
    if (!entry) return fallback;
    if (i18n?.isRussian?.()) {
      return entry[`${key}_ru`] || entry[key] || fallback;
    }
    return entry[key] || fallback;
  }

  function localizeCourse(course) {
    return {
      ...course,
      title: localizedValue(course, 'title', course.title),
      description: localizedValue(course, 'description', course.description),
      meta: localizedValue(course, 'meta', course.meta || 'Integrat Academy'),
      badge: localizedValue(course, 'badge', course.badge || 'Course'),
      priceSuffix: localizedValue(course, 'priceSuffix', course.priceSuffix || ''),
      tags: i18n?.isRussian?.() ? (course.tags_ru || course.tags || []) : (course.tags || [])
    };
  }

  function titleCase(value) {
    return String(value || '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function setFeedback(message, isError) {
    let node = documentObject.querySelector('.academy-feedback');
    if (!node) {
      node = documentObject.createElement('p');
      node.className = 'academy-feedback';
      grid.parentElement?.insertBefore(node, grid);
    }

    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
    node.classList.toggle('is-success', Boolean(!isError && message));
  }

  function paymentDetailsText() {
    const receiverNumber = paymentSettings?.receiverNumber || '+77711140710';
    const receiverName = paymentSettings?.receiverName || 'Serzhan S.';
    const instructions =
      paymentSettings?.instructions ||
      t(
        'academy_payment_default',
        'Transfer the course amount to Kaspi and then send a payment request for manager approval.'
      );
    return `${instructions}\n${receiverNumber} (${receiverName})`;
  }

  function clearCarousels() {
    carouselTimers.forEach((timer) => windowObject.clearInterval(timer));
    carouselTimers = [];
  }

  function setActiveCardSlide(card, index) {
    const dots = card.querySelectorAll('.academy-card__dot');
    const images = card.querySelectorAll('.academy-card__image');
    dots.forEach((item, itemIndex) => item.classList.toggle('active', itemIndex === index));
    images.forEach((item, itemIndex) => item.classList.toggle('active', itemIndex === index));
  }

  function initCardCarousels() {
    clearCarousels();

    grid.querySelectorAll('.academy-card').forEach((card) => {
      const dots = card.querySelectorAll('.academy-card__dot');
      const images = card.querySelectorAll('.academy-card__image');
      let currentIndex = 0;

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          currentIndex = index;
          setActiveCardSlide(card, currentIndex);
        });
      });

      if (images.length > 1) {
        const timer = windowObject.setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          setActiveCardSlide(card, currentIndex);
        }, 4500);
        carouselTimers.push(timer);
      }
    });
  }

  function renderSkeletons() {
    const count = Math.max(3, Math.min(visibleCount, 6));
    grid.innerHTML = Array.from({ length: count })
      .map(
        () => `
      <article class="academy-card academy-card--skeleton" aria-hidden="true">
        <div class="academy-card__media skeleton-box"></div>
        <div class="academy-card__body">
          <div class="skeleton-line skeleton-line--lg"></div>
          <div class="skeleton-line skeleton-line--md"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
        </div>
      </article>
    `
      )
      .join('');
  }

  function renderFilterButtons(courses) {
    if (!filtersContainer) return;

    const categories = ['all', ...new Set(courses.map((course) => course.category).filter(Boolean))];
    if (!categories.includes(activeFilter)) {
      activeFilter = 'all';
    }
    filtersContainer.innerHTML = categories
      .map(
        (category) => `
      <button class="academy-filter ${category === activeFilter ? 'active' : ''}" data-filter="${escapeHtml(category)}">
        ${category === 'all' ? t('all', 'All') : escapeHtml(titleCase(category))}
      </button>
    `
      )
      .join('');
  }

  function ensurePurchasedSection() {
    if (!isPrimaryAcademyPage) return null;

    let section = documentObject.getElementById('academyPurchasedCourses');
    if (section) return section;

    section = documentObject.createElement('section');
    section.id = 'academyPurchasedCourses';
    section.className = 'academy-purchases';
    section.innerHTML = `
      <div class="academy-purchases__head">${escapeHtml(t('academy_my_courses', 'Purchased Courses'))}</div>
      <div class="academy-purchases__list" id="academyPurchasedCoursesList"></div>
    `;

    grid.parentElement?.appendChild(section);
    return section;
  }

  function renderPurchasedCourses(courses) {
    const section = ensurePurchasedSection();
    if (!section) return;

    const list = section.querySelector('#academyPurchasedCoursesList');
    if (!list) return;

    const owned = courses
      .filter((course) => Boolean(course.hasAccess || purchasedCourseIds.has(course.id)))
      .map(localizeCourse);

    if (!currentUser) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    if (!owned.length) {
      list.innerHTML = `<p class="academy-purchases__empty">${escapeHtml(
        t('academy_no_courses', 'No purchased courses yet.')
      )}</p>`;
      return;
    }

    list.innerHTML = owned
      .map(
        (course) => `
      <a class="academy-purchases__item" href="videos.html?course=${encodeURIComponent(course.id)}">
        <span>${escapeHtml(course.title)}</span>
        <span>↗</span>
      </a>
    `
      )
      .join('');
  }

  function renderGrid(courses) {
    renderedCourses = courses;
    const filtered =
      activeFilter === 'all' ? courses : courses.filter((course) => String(course.category || '') === activeFilter);
    const visible = filtered.slice(0, visibleCount).map(localizeCourse);

    if (!visible.length) {
      grid.innerHTML = `<div class="content-state">${escapeHtml(
        t('academy_no_filter_matches', 'No courses match this filter yet.')
      )}</div>`;
      if (moreButton) moreButton.hidden = true;
      renderPurchasedCourses(courses);
      return;
    }

    grid.innerHTML = visible
      .map((course) => {
        const images = Array.isArray(course.images) && course.images.length ? course.images : ['../../assets/images/ph-integrat-group.png'];
        const dots = images
          .map(
            (_, index) =>
              `<button class="academy-card__dot ${index === 0 ? 'active' : ''}" aria-label="Image ${index + 1}"></button>`
          )
          .join('');
        const imageNodes = images
          .map(
            (image, index) =>
              `<img src="${escapeHtml(image)}" alt="${escapeHtml(course.title)}" class="academy-card__image ${
                index === 0 ? 'active' : ''
              }" />`
          )
          .join('');
        const tags = (course.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

        const hasAccess = Boolean(course.hasAccess || purchasedCourseIds.has(course.id));
        const purchaseStatus = String(course.purchaseStatus || requestStatusByCourseId.get(course.id) || '').toLowerCase();
        const isPending = purchaseStatus === 'pending';
        const canTransact = Boolean(api?.createPaymentRequest || api?.purchaseCourse);
        const actionLabel = hasAccess
          ? t('academy_open_course', 'Open Course')
          : !canTransact
            ? t('academy_view_in_academy', 'Open in Academy')
          : isPending
            ? t('academy_request_pending', 'Pending Approval')
            : t('academy_buy_course', 'Buy Course');

        const actionNode = hasAccess
          ? `<a class="academy-card__cta" href="videos.html?course=${encodeURIComponent(course.id)}">${escapeHtml(
              actionLabel
            )} <span class="academy-card__cta-icon">↗</span></a>`
          : !canTransact
            ? `<a class="academy-card__cta" href="academy.html">${escapeHtml(actionLabel)} <span class="academy-card__cta-icon">↗</span></a>`
          : `<button class="academy-card__cta" type="button" data-course-action="purchase" data-course-status="${escapeHtml(
              purchaseStatus
            )}" data-course-id="${escapeHtml(
              course.id
            )}" ${isPending ? 'disabled' : ''}>${escapeHtml(actionLabel)} <span class="academy-card__cta-icon">↗</span></button>`;

        return `
        <article class="academy-card" data-category="${escapeHtml(course.category || 'all')}">
          <div class="academy-card__media">
            <div class="academy-card__images">${imageNodes}</div>
            <div class="academy-card__overlay">
              <div class="academy-card__tags">${tags}</div>
              <div class="academy-card__rating"><span class="academy-card__star">★</span><span>${escapeHtml(
                course.rating || '4.8'
              )}</span></div>
            </div>
            <div class="academy-card__dots">${dots}</div>
          </div>
          <div class="academy-card__body">
            <div class="academy-card__header">
              <h3>${escapeHtml(course.title)}</h3>
              <span class="academy-card__badge">${escapeHtml(course.badge || 'Course')}</span>
            </div>
            <p class="academy-card__meta">${escapeHtml(course.meta || 'Integrat Academy')}</p>
            <p class="academy-card__desc">${escapeHtml(course.description)}</p>
            <div class="academy-card__footer">
              <p class="academy-card__price">${escapeHtml(
                course.priceLabel || course.price || '$0'
              )} <span>${escapeHtml(course.priceSuffix || '')}</span></p>
              ${actionNode}
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    if (moreButton) {
      moreButton.hidden = filtered.length <= visibleCount;
      moreButton.textContent =
        filtered.length > visibleCount
          ? t('academy_show_more', 'show more')
          : t('academy_all_shown', 'all courses shown');
    }

    initCardCarousels();
    renderPurchasedCourses(courses);
  }

  function mergeCourse(course, index) {
    const metadata = fallbackCourses.find((item) => item.id === course.id) || fallbackCourses[index] || {};

    return {
      ...metadata,
      ...course,
      title: course.title || metadata.title,
      description: course.description || metadata.description,
      category: metadata.category || course.category || 'academy',
      tags: metadata.tags || [],
      images: metadata.images || []
    };
  }

  async function loadUserContext() {
    currentUser = null;
    purchasedCourseIds = new Set();
    requestStatusByCourseId = new Map();

    if (!api?.me) return;

    try {
      const response = await api.me();
      currentUser = response?.user || null;

      if (currentUser && api.myPurchases) {
        const purchases = await api.myPurchases();
        const rows = Array.isArray(purchases?.purchases) ? purchases.purchases : [];
        const ids = rows.filter((item) => item?.status === 'approved' && item?.courseId).map((item) => item.courseId);
        purchasedCourseIds = new Set(ids);
        rows.forEach((item) => {
          if (item?.courseId && !requestStatusByCourseId.has(item.courseId)) {
            requestStatusByCourseId.set(item.courseId, String(item.status || '').toLowerCase());
          }
        });
      }
    } catch {
      currentUser = null;
      purchasedCourseIds = new Set();
    }
  }

  async function loadAcademyCourses() {
    renderSkeletons();

    let courses = fallbackCourses;

    await loadUserContext();

    try {
      if (api?.listCourses) {
        const response = await api.listCourses();
        if (Array.isArray(response?.courses) && response.courses.length) {
          courses = response.courses.map(mergeCourse);
        }
        paymentSettings = response?.payment || paymentSettings;
      }
      if (!paymentSettings && api?.paymentSettings) {
        const response = await api.paymentSettings();
        paymentSettings = response?.payment || paymentSettings;
      }
    } catch (error) {
      console.warn('Using fallback academy courses:', error.message);
      setFeedback(error.message || t('academy_remote_courses_failed', 'Unable to load remote courses.'), true);
    }

    courses = courses.map((course) => ({
      ...course,
      hasAccess: Boolean(course.hasAccess || purchasedCourseIds.has(course.id)),
      isPurchased: Boolean(course.isPurchased || purchasedCourseIds.has(course.id)),
      purchaseStatus: String(course.purchaseStatus || requestStatusByCourseId.get(course.id) || '').toLowerCase()
    }));

    renderFilterButtons(courses);
    renderGrid(courses);
  }

  async function handlePurchase(courseId, button) {
    if (!api?.createPaymentRequest && !api?.purchaseCourse) return;

    if (!currentUser) {
      setFeedback(t('academy_login_required', 'Please log in from Academy to access or buy this course.'), true);
      documentObject.getElementById('academyAuthButton')?.click();
      return;
    }

    if (!courseId) return;
    const status = String(button.dataset.courseStatus || '').toLowerCase();
    if (status === 'pending') {
      setFeedback(t('academy_request_pending', 'Pending Approval'), true);
      return;
    }

    const userConfirmed = windowObject.confirm(
      `${t('academy_payment_info_title', 'Payment details')}\n\n${paymentDetailsText()}\n\n${t(
        'academy_payment_confirm',
        'After payment, press OK to send your payment request.'
      )}`
    );
    if (!userConfirmed) return;

    button.disabled = true;
    const original = button.textContent;
    button.textContent = t('academy_purchase_processing', 'Processing...');

    try {
      const note = windowObject.prompt(
        t('academy_payment_note_prompt', 'Optional: add transfer comment or transaction time'),
        ''
      );
      const call = api.createPaymentRequest || api.purchaseCourse;
      await call(courseId, { paymentProvider: 'kaspi', requestNote: note || '' });
      setFeedback(t('academy_request_sent', 'Payment request sent. Admin will review it shortly.'), false);
      await loadAcademyCourses();
    } catch (error) {
      const alreadyPurchased = error.status === 409;
      setFeedback(
        alreadyPurchased
          ? t('academy_request_exists', 'Request already exists for this course.')
          : `${t('academy_buy_error', 'Purchase failed.')} ${error.message || ''}`,
        true
      );
      button.textContent = original;
    } finally {
      button.disabled = false;
    }
  }

  filtersContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('.academy-filter');
    if (!button) return;
    activeFilter = button.dataset.filter || 'all';
    visibleCount = initialVisibleCount;
    renderFilterButtons(renderedCourses);
    renderGrid(renderedCourses);
  });

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-course-action="purchase"]');
    if (!button) return;

    event.preventDefault();
    handlePurchase(button.dataset.courseId, button);
  });

  documentObject.addEventListener('integrat:academy-user', async (event) => {
    currentUser = event?.detail?.user || null;
    await loadAcademyCourses();
  });

  documentObject.addEventListener('integrat:langchange', () => {
    renderFilterButtons(renderedCourses);
    renderGrid(renderedCourses);
  });

  if (isPrimaryAcademyPage) {
    moreButton?.addEventListener('click', () => {
      visibleCount += 3;
      renderGrid(renderedCourses);
    });
  }

  loadAcademyCourses();
})(window, document);
