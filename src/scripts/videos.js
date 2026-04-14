(function videosPage() {
  const api = window.IntegratAuthApi;

  const accordions = document.querySelectorAll('[data-accordion]');
  accordions.forEach((accordion) => {
    const toggle = accordion.querySelector('.videos-card__toggle');
    const chevron = accordion.querySelector('.videos-card__chevron');

    if (!toggle && !chevron) return;

    const button = toggle || chevron;
    if (button.tagName !== 'BUTTON') {
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
    }

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

  if (!api) return;

  const accessBanner = document.getElementById('videosAccessBanner');
  const player = document.getElementById('videosPlayer');
  const controls = document.querySelector('.videos-controls');

  function setBanner(html) {
    accessBanner.classList.remove('videos-access--hidden');
    accessBanner.innerHTML = html;
  }

  function setLockedState(isLocked) {
    if (!player) return;
    player.style.opacity = isLocked ? '0.35' : '1';
    player.style.pointerEvents = isLocked ? 'none' : 'auto';
    if (controls) {
      controls.style.opacity = isLocked ? '0.35' : '1';
      controls.style.pointerEvents = isLocked ? 'none' : 'auto';
    }
  }

  async function verifyAccess() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course') || 'endo-faq';

    try {
      const me = await api.me();
      if (!me.user) {
        setLockedState(true);
        setBanner('Please <a href="academy.html">log in from Academy</a> to access this course.');
        return;
      }

      const access = await api.courseAccess(courseId);
      if (!access.hasAccess) {
        setLockedState(true);
        setBanner(
          `Your account is authenticated but this course is still locked. ` +
          `Access is granted by admin after purchase confirmation. Course: <strong>${access.course.title}</strong>.`
        );
        return;
      }

      setLockedState(false);
      setBanner(`Access granted for <strong>${access.course.title}</strong>. Enjoy the videos.`);
    } catch (error) {
      setLockedState(true);
      setBanner(`Access check failed: ${error.message}`);
    }
  }

  verifyAccess();
})();
