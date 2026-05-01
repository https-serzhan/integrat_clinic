(function videosPage(windowObject, documentObject) {
  const api = windowObject.IntegratAuthApi;
  const siteData = windowObject.IntegratSiteData || {};
  const i18n = windowObject.IntegratI18n;
  const params = new URLSearchParams(windowObject.location.search);
  const courseId = params.get('course') || 'endo-faq';
  const accessBanner = documentObject.getElementById('videosAccessBanner');
  const player = documentObject.getElementById('videosPlayer');
  const controls = documentObject.querySelector('.videos-controls');
  const sidebar = documentObject.querySelector('.videos-sidebar');
  const titleNode = documentObject.querySelector('.videos-text h1');
  const subtitleNode = documentObject.querySelector('.videos-text p');
  const closeNode = documentObject.querySelector('.videos-close');
  let paymentInfo = null;

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function format(key, values, fallback) {
    return i18n?.format ? i18n.format(key, values, fallback) : fallback;
  }

  function localizedValue(entry, key, fallback = '') {
    if (!entry) return fallback;
    if (i18n?.isRussian?.()) {
      return entry[`${key}_ru`] || entry[key] || fallback;
    }
    return entry[key] || fallback;
  }

  function getCourseMeta() {
    const catalog = siteData.academyVideoCatalog || {};
    return catalog[courseId] || null;
  }

  function setBanner(html) {
    if (!accessBanner) return;
    accessBanner.classList.remove('videos-access--hidden');
    accessBanner.innerHTML = html;
  }

  function setLockedState(isLocked) {
    if (player) {
      player.style.opacity = isLocked ? '0.35' : '1';
      player.style.pointerEvents = isLocked ? 'none' : 'auto';
    }
    if (controls) {
      controls.style.opacity = isLocked ? '0.35' : '1';
      controls.style.pointerEvents = isLocked ? 'none' : 'auto';
    }
  }

  function paymentText() {
    const number = paymentInfo?.receiverNumber || '+77711140710';
    const name = paymentInfo?.receiverName || 'Serzhan S.';
    const instructions =
      paymentInfo?.instructions ||
      t(
        'academy_payment_default',
        'Transfer the course amount to Kaspi and then send a payment request for manager approval.'
      );
    return `${instructions}\n${number} (${name})`;
  }

  function lessonIcon(type) {
    return type === 'resource' ? '▢' : '▶';
  }

  function renderCourseOutline() {
    const courseMeta = getCourseMeta();
    if (!courseMeta) {
      if (titleNode) titleNode.textContent = t('videos_unavailable_title', 'Course unavailable');
      if (subtitleNode) subtitleNode.textContent = t('videos_unavailable_subtitle', 'This course outline will be published soon.');
      if (sidebar) {
        sidebar.innerHTML = `<article class="videos-card active"><div class="videos-card__meta"><p class="videos-card__title">${t(
          'videos_unavailable_outline',
          'Course outline is not available yet.'
        )}</p></div></article>`;
      }
      return;
    }

    if (titleNode) titleNode.textContent = localizedValue(courseMeta, 'title', courseMeta.title);
    if (subtitleNode) subtitleNode.textContent = localizedValue(courseMeta, 'subtitle', courseMeta.subtitle);

    if (!sidebar) return;

    sidebar.innerHTML = courseMeta.sections
      .map(
        (section, index) => `
      <article class="videos-card ${index === 0 ? 'active' : ''}" data-accordion>
        <div class="videos-card__meta">
          <p class="videos-card__title">${localizedValue(section, 'title', section.title)}</p>
          <span class="videos-card__count">${format('videos_section_items', { count: section.lessons.length }, `${section.lessons.length} items`)}</span>
        </div>
        <button class="videos-card__toggle" type="button" aria-label="${t('videos_toggle_section', 'Toggle section')}">⌄</button>
        <ul class="videos-list">
          ${section.lessons
            .map(
              (lesson) => `
            <li class="videos-list__item">
              <span class="videos-list__icon">${lessonIcon(lesson.type)}</span>
              <span class="videos-list__text">${localizedValue(lesson, 'title', lesson.title)}</span>
              ${lesson.type === 'resource' ? '<span class="videos-list__badge">PDF</span>' : ''}
              <span class="videos-list__chevron">›</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </article>
    `
      )
      .join('');
  }

  function setupAccordions() {
    documentObject.querySelectorAll('[data-accordion]').forEach((accordion) => {
      const button = accordion.querySelector('.videos-card__toggle, .videos-card__chevron');
      if (!button) return;

      const toggleAccordion = () => {
        accordion.classList.toggle('active');
      };

      button.addEventListener('click', toggleAccordion);
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleAccordion();
        }
      });
    });
  }

  function setupLessonNavigation() {
    const navButtons = Array.from(documentObject.querySelectorAll('.videos-nav__btn'));
    const lessons = Array.from(documentObject.querySelectorAll('.videos-list__item'));
    if (navButtons.length < 2 || !lessons.length) return;

    let currentLesson = 0;

    function setLesson(index) {
      currentLesson = (index + lessons.length) % lessons.length;
      lessons.forEach((item, itemIndex) => {
        item.classList.toggle('is-current', itemIndex === currentLesson);
      });
    }

    lessons.forEach((item, index) => {
      item.addEventListener('click', () => setLesson(index));
    });

    navButtons[0].addEventListener('click', () => setLesson(currentLesson - 1));
    navButtons[1].addEventListener('click', () => setLesson(currentLesson + 1));

    setLesson(0);
  }

  async function handlePurchase() {
    if (!api?.createPaymentRequest && !api?.purchaseCourse) return;

    const accepted = windowObject.confirm(
      `${t('academy_payment_info_title', 'Payment details')}\n\n${paymentText()}\n\n${t(
        'academy_payment_confirm',
        'After payment, press OK to send your payment request.'
      )}`
    );
    if (!accepted) return;

    try {
      const note = windowObject.prompt(
        t('academy_payment_note_prompt', 'Optional: add transfer comment or transaction time'),
        ''
      );
      const call = api.createPaymentRequest || api.purchaseCourse;
      await call(courseId, { paymentProvider: 'kaspi', requestNote: note || '' });
      setLockedState(true);
      setBanner(`${t('academy_request_sent', 'Payment request sent. Admin will review it shortly.')}`);
    } catch (error) {
      setBanner(`${t('academy_buy_error', 'Purchase failed.')} ${error.message || ''}`);
    }
  }

  function wireBannerActions() {
    const buyButton = documentObject.getElementById('videosBuyNow');
    buyButton?.addEventListener('click', handlePurchase);
  }

  async function verifyAccess() {
    if (!api) return;

    try {
      const me = await api.me();
      if (!me.user) {
        setLockedState(true);
        setBanner(
          `${t('academy_login_required', 'Please log in from Academy to access or buy this course.')} ` +
            `<a href="academy.html">${t('videos_open_academy', 'Academy')}</a>`
        );
        return;
      }

      const access = await api.courseAccess(courseId);
      paymentInfo = access?.payment || paymentInfo;
      if (!access.hasAccess) {
        setLockedState(true);
        if (access?.purchase?.status === 'pending') {
          setBanner(`${t('academy_request_pending', 'Pending Approval')}`);
        } else {
          setBanner(
            `${t('academy_buy_first', 'Purchase this course to unlock all lessons.')} ` +
              `<button id="videosBuyNow" class="btn-black" type="button">${t('academy_buy_course', 'Buy Course')}</button>`
          );
          wireBannerActions();
        }
        return;
      }

      setLockedState(false);
      const courseMeta = getCourseMeta();
      const localizedTitle = courseMeta
        ? localizedValue(courseMeta, 'title', access.course?.title || '')
        : (access.course?.title || t('videos_unavailable_title', 'Course unavailable'));
      setBanner(`${t('academy_open_course', 'Open Course')}: <strong>${localizedTitle}</strong>`);
    } catch (error) {
      setLockedState(true);
      setBanner(format('videos_access_failed', { message: error.message }, `Access check failed: ${error.message}`));
    }
  }

  closeNode?.addEventListener('click', () => {
    windowObject.location.href = 'academy.html';
  });

  documentObject.addEventListener('integrat:langchange', () => {
    renderCourseOutline();
    setupAccordions();
    setupLessonNavigation();
    verifyAccess();
  });

  renderCourseOutline();
  setupAccordions();
  setupLessonNavigation();
  verifyAccess();
})(window, document);
