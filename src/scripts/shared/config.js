const integratRuntimeOrigin =
  window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'http://localhost:3000';

window.INTEGRAT_RUNTIME_CONFIG = {
  clinicApiBaseUrl: integratRuntimeOrigin,
  academyApiBaseUrl: integratRuntimeOrigin,
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
  }
};
