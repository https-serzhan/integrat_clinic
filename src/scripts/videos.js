(function videosPage(windowObject, documentObject) {
  const api = windowObject.IntegratAuthApi;
  const siteData = windowObject.IntegratSiteData || {};
  const i18n = windowObject.IntegratI18n;
  const params = new URLSearchParams(windowObject.location.search);
  const courseId = params.get('course') || 'endo-faq';
  const accessBanner = documentObject.getElementById('videosAccessBanner');
  const player = documentObject.getElementById('videosPlayer');
  const playerStage = documentObject.getElementById('videosPlayerStage');
  const controls = documentObject.querySelector('.videos-controls');
  const sidebar = documentObject.getElementById('videosSidebar');
  const titleNode = documentObject.querySelector('.videos-text h1');
  const subtitleNode = documentObject.querySelector('.videos-text p');
  const closeNode = documentObject.querySelector('.videos-close');
  const progressNode = documentObject.getElementById('videosProgress');
  const previousButton = documentObject.getElementById('videosPrevLesson');
  const nextButton = documentObject.getElementById('videosNextLesson');
  const courseMeta = (siteData.academyVideoCatalog || {})[courseId] || null;
  const courseCard =
    (Array.isArray(siteData.academyCourses) ? siteData.academyCourses : []).find((course) => course.id === courseId) || null;
  const homeVideoSrc = siteData.media?.homeVideoSrc || 'https://www.w3schools.com/html/mov_bbb.mp4';

  let paymentInfo = null;
  let currentLessonIndex = 0;
  let accordionState = new Set([0]);
  let flatLessons = [];

  function t(key, fallback) {
    return i18n?.t ? i18n.t(key, fallback) : fallback;
  }

  function format(key, values, fallback) {
    return i18n?.format ? i18n.format(key, values, fallback) : fallback;
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

  function setBanner(html) {
    if (!accessBanner) return;
    accessBanner.classList.remove('videos-access--hidden');
    accessBanner.innerHTML = html;
  }

  function clearBanner() {
    if (!accessBanner) return;
    accessBanner.classList.add('videos-access--hidden');
    accessBanner.innerHTML = '';
  }

  function setLockedState(isLocked) {
    if (player) {
      player.classList.toggle('is-locked', Boolean(isLocked));
    }
    if (controls) {
      controls.classList.toggle('is-locked', Boolean(isLocked));
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
    return type === 'resource' ? 'PDF' : '▶';
  }

  function courseImages() {
    if (Array.isArray(courseCard?.images) && courseCard.images.length) {
      return courseCard.images;
    }
    return ['../../assets/images/ph-integrat-group.png'];
  }

  function ensureLessonData() {
    if (!courseMeta?.sections?.length) {
      flatLessons = [];
      return [];
    }

    const images = courseImages();
    const lessons = [];

    courseMeta.sections.forEach((section, sectionIndex) => {
      section.lessons.forEach((lesson, lessonIndex) => {
        lessons.push({
          sectionIndex,
          lessonIndex,
          title: localizedValue(lesson, 'title', lesson.title),
          type: lesson.type || 'video',
          resourceUrl: lesson.resourceUrl || null,
          resourceLabel: localizedValue(lesson, 'resourceLabel', lesson.resourceLabel || 'Supporting material'),
          sectionTitle: localizedValue(section, 'title', section.title),
          courseTitle: localizedValue(courseMeta, 'title', courseMeta.title),
          courseSubtitle: localizedValue(courseMeta, 'subtitle', courseMeta.subtitle),
          videoSrc: lesson.videoSrc || homeVideoSrc,
          previewImage: images[lessons.length % images.length]
        });
      });
    });

    flatLessons = lessons;
    return lessons;
  }

  function currentLesson() {
    if (!flatLessons.length) return null;
    return flatLessons[currentLessonIndex] || flatLessons[0] || null;
  }

  function lessonButtonMarkup(lesson, index) {
    return `
      <li>
        <button
          class="videos-list__item ${index === currentLessonIndex ? 'is-current' : ''}"
          type="button"
          data-lesson-index="${index}">
          <span class="videos-list__icon">${escapeHtml(lessonIcon(lesson.type))}</span>
          <span class="videos-list__text">${escapeHtml(lesson.title)}</span>
          ${lesson.type === 'resource' ? '<span class="videos-list__badge">PDF</span>' : ''}
          <span class="videos-list__chevron">›</span>
        </button>
      </li>
    `;
  }

  function renderCourseOutline() {
    if (!courseMeta) {
      if (titleNode) titleNode.textContent = t('videos_unavailable_title', 'Course unavailable');
      if (subtitleNode) {
        subtitleNode.textContent = t('videos_unavailable_subtitle', 'This course outline will be published soon.');
      }
      if (sidebar) {
        sidebar.innerHTML = `<article class="videos-card active"><div class="videos-card__meta"><p class="videos-card__title">${escapeHtml(
          t('videos_unavailable_outline', 'Course outline is not available yet.')
        )}</p></div></article>`;
      }
      return;
    }

    ensureLessonData();
    const activeLesson = currentLesson();

    if (titleNode) {
      titleNode.textContent = activeLesson?.title || localizedValue(courseMeta, 'title', courseMeta.title);
    }
    if (subtitleNode) {
      subtitleNode.textContent = activeLesson
        ? `${activeLesson.courseSubtitle} · ${activeLesson.sectionTitle}`
        : localizedValue(courseMeta, 'subtitle', courseMeta.subtitle);
    }

    if (!sidebar) return;

    let lessonOffset = 0;
    sidebar.innerHTML = courseMeta.sections
      .map((section, sectionIndex) => {
        const isOpen = accordionState.has(sectionIndex);
        const localizedSectionTitle = localizedValue(section, 'title', section.title);
        const items = section.lessons
          .map((_lesson, lessonIndex) => {
            const markup = lessonButtonMarkup(flatLessons[lessonOffset + lessonIndex], lessonOffset + lessonIndex);
            return markup;
          })
          .join('');
        lessonOffset += section.lessons.length;

        return `
          <article class="videos-card ${isOpen ? 'active' : ''}" data-section-index="${sectionIndex}">
            <button class="videos-card__top" type="button" data-accordion-toggle>
              <div class="videos-card__meta">
                <p class="videos-card__title">${escapeHtml(localizedSectionTitle)}</p>
                <span class="videos-card__count">${escapeHtml(
                  format('videos_section_items', { count: section.lessons.length }, `${section.lessons.length} items`)
                )}</span>
              </div>
              <span class="videos-card__toggle" aria-label="${escapeHtml(
                t('videos_toggle_section', 'Toggle section')
              )}">${isOpen ? '⌄' : '›'}</span>
            </button>
            <ul class="videos-list">${items}</ul>
          </article>
        `;
      })
      .join('');
  }

  function renderPlayer() {
    const lesson = currentLesson();
    if (!lesson || !playerStage) {
      return;
    }

    if (titleNode) titleNode.textContent = lesson.title;
    if (subtitleNode) subtitleNode.textContent = `${lesson.courseSubtitle} · ${lesson.sectionTitle}`;

    if (lesson.type === 'resource') {
      playerStage.innerHTML = `
        <div class="videos-player__resource" style="background-image: url('${escapeHtml(lesson.previewImage)}')">
          <div class="videos-player__resource-content">
            <span class="videos-player__pill">PDF</span>
            <h2>${escapeHtml(lesson.title)}</h2>
            <p>${escapeHtml(lesson.resourceLabel)}</p>
            ${
              lesson.resourceUrl
                ? `<a class="videos-player__action" href="${escapeHtml(
                    lesson.resourceUrl
                  )}" target="_blank" rel="noopener noreferrer">Open PDF</a>`
                : ''
            }
          </div>
        </div>
      `;
    } else {
      playerStage.innerHTML = `
        <video
          class="videos-player__video"
          controls
          playsinline
          preload="metadata"
          poster="${escapeHtml(lesson.previewImage)}"
          src="${escapeHtml(lesson.videoSrc)}"></video>
      `;
    }

    if (progressNode) {
      progressNode.textContent = `Lesson ${currentLessonIndex + 1} of ${flatLessons.length}`;
    }

    if (previousButton) previousButton.disabled = currentLessonIndex <= 0;
    if (nextButton) nextButton.disabled = currentLessonIndex >= flatLessons.length - 1;
  }

  function openLesson(index) {
    if (!flatLessons.length) return;
    const safeIndex = Math.max(0, Math.min(index, flatLessons.length - 1));
    currentLessonIndex = safeIndex;
    accordionState.add(flatLessons[safeIndex].sectionIndex);
    renderCourseOutline();
    renderPlayer();
  }

  function handleSidebarClick(event) {
    const toggle = event.target.closest('[data-accordion-toggle]');
    if (toggle) {
      const card = toggle.closest('[data-section-index]');
      const sectionIndex = Number(card?.dataset.sectionIndex || 0);
      if (accordionState.has(sectionIndex)) {
        accordionState.delete(sectionIndex);
      } else {
        accordionState.add(sectionIndex);
      }
      renderCourseOutline();
      return;
    }

    const lessonButton = event.target.closest('[data-lesson-index]');
    if (lessonButton) {
      openLesson(Number(lessonButton.dataset.lessonIndex || 0));
    }
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

      clearBanner();
      setLockedState(false);
    } catch (error) {
      setLockedState(true);
      setBanner(format('videos_access_failed', { message: error.message }, `Access check failed: ${error.message}`));
    }
  }

  previousButton?.addEventListener('click', () => openLesson(currentLessonIndex - 1));
  nextButton?.addEventListener('click', () => openLesson(currentLessonIndex + 1));
  sidebar?.addEventListener('click', handleSidebarClick);

  closeNode?.addEventListener('click', () => {
    windowObject.location.href = 'academy.html';
  });

  documentObject.addEventListener('integrat:langchange', () => {
    ensureLessonData();
    renderCourseOutline();
    renderPlayer();
    verifyAccess();
  });

  ensureLessonData();
  renderCourseOutline();
  renderPlayer();
  verifyAccess();
})(window, document);
