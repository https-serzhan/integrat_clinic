(function i18nBootstrap(windowObject, documentObject) {
  const config = windowObject.IntegratConfig || {};
  const i18nConfig = config.i18n || {};
  const storageKey = i18nConfig.storageKey || 'integrat.lang';

  const translations = {
    en: {
      form_invalid: 'Please complete the form correctly before submitting.',
      form_sending: 'Sending your request...',
      form_success: 'Request sent. The Integrat team will contact you shortly.',
      form_api_missing: 'Clinic API is not configured yet. Update the frontend runtime config first.',
      appointment_submitting: 'Submitting appointment request...',
      appointment_success: 'Appointment request submitted successfully.',
      appointment_error: 'Failed to create appointment.',
      appointment_pick_time: 'Select a preferred appointment time before continuing.',
      appointment_no_auth: 'Please log in before booking an appointment.',
      auth_login_failed: 'Login failed.',
      auth_register_failed: 'Registration failed.',
      auth_password_mismatch: 'Passwords do not match.',
      auth_password_short: 'Password must be at least 8 characters.',
      auth_password_weak:
        'Use at least 8 characters with uppercase, lowercase, number, and symbol.',
      academy_login_required: 'Please log in from Academy to access or buy this course.',
      academy_buy_first: 'Purchase this course to unlock all lessons.',
      academy_buy_success: 'Purchase completed. Course access is now unlocked.',
      academy_buy_error: 'Purchase failed.',
      academy_open_course: 'Open Course',
      academy_buy_course: 'Buy Course',
      academy_view_in_academy: 'Open in Academy',
      academy_already_purchased: 'Purchased',
      academy_request_pending: 'Pending Approval',
      academy_request_exists: 'Request already exists for this course.',
      academy_request_sent: 'Payment request sent. Admin will review it shortly.',
      academy_payment_default:
        'Transfer the course amount to Kaspi and then send a payment request for manager approval.',
      academy_payment_info_title: 'Payment details',
      academy_payment_confirm: 'After payment, press OK to send your payment request.',
      academy_payment_note_prompt: 'Optional: add transfer comment or transaction time',
      academy_purchase_processing: 'Processing...',
      academy_my_courses: 'Purchased Courses',
      academy_no_courses: 'No purchased courses yet.',
      academy_show_more: 'show more',
      academy_all_shown: 'all courses shown',
      all: 'All',
      language_button_en: 'ENG',
      language_button_ru: 'RU',
      contact_request_failed: 'Failed to send the request.',
      contact_network_error: 'Cannot reach backend API. Start backend on http://localhost:3000 and retry.',
      doctor_specialist_fallback: 'Dental specialist',
      doctor_name_fallback: 'Integrat doctor',
      doctor_education_fallback: 'Education profile will be published soon.',
      doctor_focus_fallback: 'Comprehensive dental treatment.',
      doctor_experience: 'Experience: {years} years',
      doctor_education_label: 'Education:',
      doctor_focus_label: 'Focus:',
      doctor_booking_label: 'Preferred appointment time',
      doctor_incomplete: 'Doctor information is incomplete.',
      doctor_api_missing: 'Clinic API is not configured yet.',
      doctors_empty: 'Profiles will be added soon.',
      admin_unknown_user: 'Unknown user',
      admin_granted_at: 'Granted at {datetime}',
      admin_remove: 'Remove',
      admin_no_users: 'No users yet.',
      admin_no_grants: 'No active grants.',
      admin_no_purchases: 'No purchases yet.',
      admin_no_payment_requests: 'No payment requests yet.',
      admin_approve: 'Approve',
      admin_reject: 'Reject',
      admin_request_approved: 'Payment request approved.',
      admin_request_rejected: 'Payment request rejected.',
      admin_grant_removed: 'Grant removed.',
      admin_grant_success: 'Permission granted successfully.',
      videos_section_items: '{count} items',
      videos_toggle_section: 'Toggle section',
      videos_collapse_section: 'Collapse section',
      videos_open_academy: 'Academy',
      videos_access_failed: 'Access check failed: {message}',
      videos_unavailable_title: 'Course unavailable',
      videos_unavailable_subtitle: 'This course outline will be published soon.',
      videos_unavailable_outline: 'Course outline is not available yet.',
      academy_remote_courses_failed: 'Unable to load remote courses.',
      academy_no_filter_matches: 'No courses match this filter yet.'
    },
    ru: {
      form_invalid: 'Пожалуйста, заполните форму корректно перед отправкой.',
      form_sending: 'Отправляем вашу заявку...',
      form_success: 'Заявка отправлена. Команда Integrat скоро свяжется с вами.',
      form_api_missing: 'Clinic API пока не настроен. Обновите runtime-конфиг фронтенда.',
      appointment_submitting: 'Отправляем запрос на прием...',
      appointment_success: 'Запрос на прием успешно отправлен.',
      appointment_error: 'Не удалось создать запись на прием.',
      appointment_pick_time: 'Выберите удобное время приема перед отправкой.',
      appointment_no_auth: 'Пожалуйста, войдите перед записью на прием.',
      auth_login_failed: 'Не удалось войти.',
      auth_register_failed: 'Регистрация не удалась.',
      auth_password_mismatch: 'Пароли не совпадают.',
      auth_password_short: 'Пароль должен содержать минимум 8 символов.',
      auth_password_weak:
        'Используйте минимум 8 символов с заглавной, строчной буквой, цифрой и спецсимволом.',
      academy_login_required: 'Войдите через Academy, чтобы открыть или купить этот курс.',
      academy_buy_first: 'Купите этот курс, чтобы разблокировать все уроки.',
      academy_buy_success: 'Покупка завершена. Доступ к курсу открыт.',
      academy_buy_error: 'Не удалось выполнить покупку.',
      academy_open_course: 'Открыть курс',
      academy_buy_course: 'Купить курс',
      academy_view_in_academy: 'Открыть в академии',
      academy_already_purchased: 'Куплено',
      academy_request_pending: 'Ожидает подтверждения',
      academy_request_exists: 'Заявка по этому курсу уже создана.',
      academy_request_sent: 'Заявка на оплату отправлена. Администратор проверит ее в ближайшее время.',
      academy_payment_default:
        'Переведите сумму курса через Kaspi и затем отправьте заявку на подтверждение оплаты менеджером.',
      academy_payment_info_title: 'Реквизиты оплаты',
      academy_payment_confirm: 'После оплаты нажмите OK, чтобы отправить заявку на подтверждение.',
      academy_payment_note_prompt: 'Необязательно: добавьте комментарий к переводу или время оплаты',
      academy_purchase_processing: 'Обработка...',
      academy_my_courses: 'Купленные курсы',
      academy_no_courses: 'Пока нет купленных курсов.',
      academy_show_more: 'показать еще',
      academy_all_shown: 'показаны все курсы',
      all: 'Все',
      language_button_en: 'ENG',
      language_button_ru: 'RU',
      contact_request_failed: 'Не удалось отправить заявку.',
      contact_network_error: 'Нет соединения с backend API. Запустите backend на http://localhost:3000 и попробуйте снова.',
      doctor_specialist_fallback: 'Стоматолог',
      doctor_name_fallback: 'Врач Integrat',
      doctor_education_fallback: 'Профиль образования будет опубликован позже.',
      doctor_focus_fallback: 'Комплексное стоматологическое лечение.',
      doctor_experience: 'Опыт: {years} лет',
      doctor_education_label: 'Образование:',
      doctor_focus_label: 'Профиль:',
      doctor_booking_label: 'Предпочтительное время приема',
      doctor_incomplete: 'Информация о враче заполнена не полностью.',
      doctor_api_missing: 'Clinic API пока не настроен.',
      doctors_empty: 'Профили будут добавлены позже.',
      admin_unknown_user: 'Неизвестный пользователь',
      admin_granted_at: 'Выдано {datetime}',
      admin_remove: 'Удалить',
      admin_no_users: 'Пользователей пока нет.',
      admin_no_grants: 'Активных доступов пока нет.',
      admin_no_purchases: 'Покупок пока нет.',
      admin_no_payment_requests: 'Заявок на оплату пока нет.',
      admin_approve: 'Подтвердить',
      admin_reject: 'Отклонить',
      admin_request_approved: 'Заявка на оплату подтверждена.',
      admin_request_rejected: 'Заявка на оплату отклонена.',
      admin_grant_removed: 'Доступ удален.',
      admin_grant_success: 'Доступ успешно выдан.',
      videos_section_items: '{count} материалов',
      videos_toggle_section: 'Переключить раздел',
      videos_collapse_section: 'Свернуть раздел',
      videos_open_academy: 'Академия',
      videos_access_failed: 'Ошибка проверки доступа: {message}',
      videos_unavailable_title: 'Курс пока недоступен',
      videos_unavailable_subtitle: 'Программа этого курса будет опубликована позже.',
      videos_unavailable_outline: 'Программа курса пока не опубликована.',
      academy_remote_courses_failed: 'Не удалось загрузить курсы с backend.',
      academy_no_filter_matches: 'По этому фильтру курсов пока нет.'
    }
  };

  const phrasePairs = Array.isArray(i18nConfig.phrases) ? i18nConfig.phrases : [];
  const phraseLookup = {};

  function normalize(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  phrasePairs.forEach((pair) => {
    const en = normalize(pair.en);
    const ru = normalize(pair.ru);
    if (!en || !ru) return;
    phraseLookup[en] = { en: pair.en, ru: pair.ru };
    phraseLookup[ru] = { en: pair.en, ru: pair.ru };
  });

  function getStoredLanguage() {
    try {
      const value = windowObject.localStorage.getItem(storageKey);
      if (value === 'ru' || value === 'en') return value;
    } catch {}

    const htmlLang = (documentObject.documentElement.getAttribute('lang') || '').toLowerCase();
    if (htmlLang.startsWith('ru')) return 'ru';
    return i18nConfig.defaultLang === 'ru' ? 'ru' : 'en';
  }

  let currentLanguage = getStoredLanguage();

  function setStoredLanguage(lang) {
    try {
      windowObject.localStorage.setItem(storageKey, lang);
    } catch {}
  }

  function t(key, fallback) {
    const table = translations[currentLanguage] || translations.en;
    return table[key] || fallback || key;
  }

  function formatTemplate(template, values = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_match, key) => {
      const value = values[key];
      return value === undefined || value === null ? '' : String(value);
    });
  }

  function translateTextNode(node) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;

    const pair = phraseLookup[normalize(trimmed)];
    if (!pair) return;

    const next = pair[currentLanguage];
    if (!next || trimmed === next) return;
    node.nodeValue = raw.replace(trimmed, next);
  }

  function translateAttributes() {
    const attributes = ['placeholder', 'aria-label', 'title'];
    attributes.forEach((attribute) => {
      documentObject.querySelectorAll(`[${attribute}]`).forEach((node) => {
        const raw = node.getAttribute(attribute);
        const pair = phraseLookup[normalize(raw)];
        if (!pair) return;
        node.setAttribute(attribute, pair[currentLanguage]);
      });
    });
  }

  function applyDataKeyTranslations() {
    documentObject.querySelectorAll('[data-i18n-key]').forEach((node) => {
      const key = node.getAttribute('data-i18n-key');
      const attr = node.getAttribute('data-i18n-attr');
      const value = t(key, node.textContent || '');
      if (attr) {
        node.setAttribute(attr, value);
      } else {
        node.textContent = value;
      }
    });
  }

  function bindLanguageButtons() {
    documentObject.querySelectorAll('.btn-outline, [data-lang-toggle]').forEach((button) => {
      if (button.dataset.langBound === '1') return;
      button.dataset.langBound = '1';
      button.type = button.type || 'button';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        setLanguage(currentLanguage === 'en' ? 'ru' : 'en');
      });
    });
  }

  function syncLanguageButtonText() {
    const label = currentLanguage === 'en' ? t('language_button_ru', 'RU') : t('language_button_en', 'ENG');
    documentObject.querySelectorAll('.btn-outline, [data-lang-toggle]').forEach((button) => {
      if (!button.closest('.header-right, .auth-page, .admin-header, .videos-header, .faq-header')) return;
      button.textContent = label;
    });
  }

  function applyDomTranslations() {
    bindLanguageButtons();

    if (documentObject.body) {
      const walker = documentObject.createTreeWalker(
        documentObject.body,
        windowObject.NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.parentElement) return windowObject.NodeFilter.FILTER_REJECT;
            const tag = node.parentElement.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE') return windowObject.NodeFilter.FILTER_REJECT;
            return windowObject.NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node = walker.nextNode();
      while (node) {
        translateTextNode(node);
        node = walker.nextNode();
      }
    }

    translateAttributes();
    applyDataKeyTranslations();
    syncLanguageButtonText();
    documentObject.documentElement.setAttribute('lang', currentLanguage);

    const CustomEventConstructor = windowObject.CustomEvent || globalThis.CustomEvent;
    if (typeof CustomEventConstructor === 'function') {
      documentObject.dispatchEvent(
        new CustomEventConstructor('integrat:langchange', {
          detail: { lang: currentLanguage }
        })
      );
    }
  }

  function setLanguage(lang) {
    const next = lang === 'ru' ? 'ru' : 'en';
    currentLanguage = next;
    setStoredLanguage(next);
    applyDomTranslations();
  }

  function init() {
    bindLanguageButtons();
    applyDomTranslations();
  }

  windowObject.IntegratI18n = {
    get lang() {
      return currentLanguage;
    },
    t,
    format(key, values, fallback) {
      return formatTemplate(t(key, fallback), values);
    },
    setLanguage,
    applyDomTranslations,
    isRussian() {
      return currentLanguage === 'ru';
    }
  };

  if (documentObject.readyState === 'loading') {
    documentObject.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
