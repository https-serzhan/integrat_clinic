(function globalNavigation(windowObject, documentObject) {
  const config = windowObject.IntegratConfig || {};
  const contact = config.contact || {};
  const socials = config.socials || {};
  const siteScope = config.siteScope || {};
  const navItems = Array.isArray(siteScope.navItems) ? siteScope.navItems : [];
  const archivedPages = Array.isArray(siteScope.archivedPages) ? siteScope.archivedPages : [];
  const currentPage = windowObject.location.pathname.split('/').pop() || 'index.html';

  const storage = {
    get(key) {
      try {
        return windowObject.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    remove(key) {
      try {
        windowObject.localStorage.removeItem(key);
      } catch {}
    }
  };

  function isAuthPage() {
    return currentPage === 'auth.html';
  }

  function hasToken() {
    return Boolean(storage.get('token'));
  }

  function scrollToContactForm() {
    const contactForm = documentObject.getElementById('contactForm');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      contactForm.classList.add('highlight-flash');
      windowObject.setTimeout(() => contactForm.classList.remove('highlight-flash'), 1500);
      return true;
    }

    return false;
  }

  function goToAuth() {
    if (isAuthPage()) return;
    const returnTo = `${currentPage}${windowObject.location.search || ''}${windowObject.location.hash || ''}`;
    windowObject.location.href = `auth.html?returnTo=${encodeURIComponent(returnTo)}`;
  }

  function goToAppointmentFlow() {
    if (hasToken()) {
      windowObject.location.href = 'doctors.html';
      return;
    }

    windowObject.location.href = 'auth.html?returnTo=doctors.html';
  }

  function wireHeaderButton() {
    const primaryButton = documentObject.querySelector('.header-right .btn-black');
    if (!primaryButton || primaryButton.id === 'academyAuthButton') return;

    const originalLabel = primaryButton.textContent.trim().toLowerCase();
    const loginLike = /login|sign in|account|войти|логин|аккаунт/.test(originalLabel);
    const ctaLike = /get in touch|contact|book|связ|контакт|запис/.test(originalLabel);

    primaryButton.replaceWith(primaryButton.cloneNode(true));
    const cleanButton = documentObject.querySelector('.header-right .btn-black');
    if (!cleanButton) return;

    if (loginLike) {
      if (hasToken()) {
        cleanButton.textContent = 'LOGOUT';
        cleanButton.addEventListener('click', async () => {
          try {
            if (windowObject.api?.logout) {
              await windowObject.api.logout();
            }
          } catch {}

          storage.remove('token');
          windowObject.location.reload();
        });
      } else {
        cleanButton.textContent = 'LOGIN';
        cleanButton.addEventListener('click', goToAuth);
      }
      return;
    }

    if (ctaLike) {
      cleanButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (!scrollToContactForm()) {
          windowObject.location.href = 'index.html#contactForm';
        }
      });
    }
  }

  function wireBookingButtons() {
    documentObject.querySelectorAll('.book-pill').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        goToAppointmentFlow();
      });
    });
  }

  function wirePromoButtons() {
    documentObject.querySelectorAll('.treatment-card[href="#"]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        goToAppointmentFlow();
      });
    });
  }

  function syncActiveNavigation() {
    documentObject.querySelectorAll('.nav-pill .pill').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === currentPage);
    });
  }

  function renderSharedNavigation() {
    if (!navItems.length) return;

    documentObject.querySelectorAll('.nav-pill').forEach((nav) => {
      nav.innerHTML = navItems.map((item) => `
        <a href="${item.href}" class="pill">${item.label}</a>
      `).join('');
    });

    documentObject.querySelectorAll('.site-footer__links').forEach((nav) => {
      nav.innerHTML = navItems.map((item) => `
        <a class="site-footer__link" href="${item.href}">${item.label}</a>
      `).join('');
    });
  }

  function pruneArchivedNavigation() {
    if (!archivedPages.length) return;

    documentObject.querySelectorAll('.nav-pill .pill, .site-footer__link').forEach((link) => {
      const href = link.getAttribute('href');
      if (archivedPages.includes(href)) {
        link.remove();
      }
    });
  }

  function makeLogoClickable() {
    documentObject.querySelectorAll('.logo, .site-footer__logo').forEach((logo) => {
      if (logo.tagName === 'A') return;
      logo.addEventListener('click', () => {
        windowObject.location.href = 'index.html';
      });
      logo.style.cursor = 'pointer';
    });
  }

  function setLinkState(anchor, url) {
    if (!anchor) return;

    if (url) {
      anchor.href = url;
      anchor.classList.remove('link-disabled');
      anchor.removeAttribute('aria-disabled');
      if (/^https?:\/\//i.test(url)) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      } else {
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      }
      return;
    }

    anchor.href = '#';
    anchor.classList.add('link-disabled');
    anchor.setAttribute('aria-disabled', 'true');
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
  }

  function populateGlobalContent() {
    documentObject.querySelectorAll('.address').forEach((node) => {
      node.textContent = contact.address || node.textContent;
    });

    documentObject.querySelectorAll('.phone').forEach((node) => {
      node.textContent = contact.phone || node.textContent;
    });

    documentObject.querySelectorAll('.map').forEach((frame) => {
      if (contact.mapEmbedUrl) {
        frame.src = contact.mapEmbedUrl;
      }
    });

    const year = String(new Date().getFullYear());
    documentObject.querySelectorAll('.site-footer__copy').forEach((node) => {
      node.textContent = `© ${year} Integrat. All rights reserved.`;
    });

    documentObject.querySelectorAll('.site-footer__tagline').forEach((node) => {
      node.textContent = siteScope.footerTagline || node.textContent;
    });

    documentObject.querySelectorAll('a.social, a.site-footer__social').forEach((anchor) => {
      const label = `${anchor.getAttribute('aria-label') || ''} ${anchor.querySelector('img')?.getAttribute('src') || ''}`.toLowerCase();
      if (label.includes('instagram')) {
        setLinkState(anchor, socials.instagram);
      } else if (label.includes('telegram')) {
        setLinkState(anchor, socials.telegram);
      } else if (label.includes('whatsapp')) {
        setLinkState(anchor, socials.whatsapp);
      } else if (label.includes('google')) {
        setLinkState(anchor, socials.google);
      }
    });
  }

  function init() {
    renderSharedNavigation();
    pruneArchivedNavigation();
    syncActiveNavigation();
    wireHeaderButton();
    wireBookingButtons();
    wirePromoButtons();
    makeLogoClickable();
    populateGlobalContent();
    windowObject.IntegratI18n?.applyDomTranslations?.();
  }

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
