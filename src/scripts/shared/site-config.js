(function attachSiteConfig(windowObject) {
  const storage = {
    get(key) {
      try {
        return windowObject.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
  };

  const origin =
    windowObject.location.origin && windowObject.location.origin !== 'null'
      ? windowObject.location.origin
      : 'http://127.0.0.1:3000';

  windowObject.IntegratConfig = {
    ...(windowObject.IntegratConfig || {}),
    clinicApiBaseUrl: storage.get('integrat.clinicApiBaseUrl') || origin,
    academyApiBaseUrl: storage.get('integrat.academyApiBaseUrl') || origin,
    contact: {
      address: 'Astana, Mangilik El 36',
      phone: '+7 747 457 17 40',
      tel: '+77474571740',
      email: 'hello@integrat.kz',
      mapEmbedUrl: 'https://www.google.com/maps?q=Astana%20Mangilik%20El%2036&output=embed'
    },
    socials: {
      instagram: 'https://www.instagram.com/https.serzhan/',
      telegram: 'https://t.me/altawh1d',
      whatsapp: 'https://wa.me/+77711140710',
      google: 'https://www.youtube.com/watch?v=2qBlE2-WL60'
    },
    siteScope: {
      navItems: [
        { href: 'index.html', label: 'HOME' },
        { href: 'clinic.html', label: 'CLINIC' },
        { href: 'doctors.html', label: 'DOCTORS' },
        { href: 'academy.html', label: 'ACADEMY' },
        { href: 'about.html', label: 'ABOUT US' }
      ],
      archivedPages: ['laboratory.html', 'store.html'],
      footerTagline: 'Next-generation dental ecosystem focused on clinic care, doctors, and academy education.'
    },
    i18n: {
      defaultLang: 'en'
    }
  };
})(window);
