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

  const runtimeConfig = windowObject.INTEGRAT_RUNTIME_CONFIG || {};
  const origin = windowObject.location.origin && windowObject.location.origin !== 'null'
    ? windowObject.location.origin
    : '';
  const i18nPhrases = [
    { en: 'HOME', ru: 'ГЛАВНАЯ' },
    { en: 'CLINIC', ru: 'КЛИНИКА' },
    { en: 'DOCTORS', ru: 'ВРАЧИ' },
    { en: 'ACADEMY', ru: 'АКАДЕМИЯ' },
    { en: 'ABOUT US', ru: 'О НАС' },
    { en: 'GET IN TOUCH', ru: 'СВЯЗАТЬСЯ' },
    { en: 'LOGIN', ru: 'ВОЙТИ' },
    { en: 'LOGOUT', ru: 'ВЫЙТИ' },
    { en: 'Book an appointment', ru: 'Записаться на прием' },
    { en: 'MORE DETAILS', ru: 'ПОДРОБНЕЕ' },
    { en: 'All', ru: 'Все' },
    { en: 'Veneers', ru: 'Виниры' },
    { en: 'Implants', ru: 'Импланты' },
    { en: 'Ortho', ru: 'Ортодонтия' },
    { en: 'show more', ru: 'показать еще' },
    { en: 'all courses shown', ru: 'показаны все курсы' },
    { en: 'Open Course', ru: 'Открыть курс' },
    { en: 'Buy Course', ru: 'Купить курс' },
    { en: 'Create Account', ru: 'Создать аккаунт' },
    { en: 'Login', ru: 'Вход' },
    { en: 'Sign Up', ru: 'Регистрация' },
    { en: 'Close', ru: 'Закрыть' },
    { en: 'Our Courses', ru: 'Наши курсы' },
    { en: 'Purchased Courses', ru: 'Купленные курсы' },
    { en: 'NEXT-GENERATION DENTAL COMPANY', ru: 'СТОМАТОЛОГИЧЕСКАЯ КОМПАНИЯ НОВОГО ПОКОЛЕНИЯ' },
    { en: 'A clinic and academy united by one approach to functional, aesthetic, and evidence-led dentistry.', ru: 'Клиника и академия, объединенные единым подходом к функциональной, эстетической и доказательной стоматологии.' },
    { en: 'WHY CHOOSE OUR CLINIC', ru: 'ПОЧЕМУ ВЫБИРАЮТ НАШУ КЛИНИКУ' },
    { en: 'CARE', ru: 'ЗАБОТА' },
    { en: 'ORGANIZATION OF OCCLUSION', ru: 'ОРГАНИЗАЦИЯ ОККЛЮЗИИ' },
    { en: 'Комплексный разбор принципов организации окклюзии, биомеханических основ и клиничесческих подходов к управлению перемещением зубов', ru: 'Комплексный разбор принципов организации окклюзии, биомеханических основ и клиничесческих подходов к управлению перемещением зубов' },
    { en: 'A comprehensive review of occlusion design principles, biomechanics, and clinical approaches to tooth movement control.', ru: 'Комплексный разбор принципов организации окклюзии, биомеханических основ и клинических подходов к контролю перемещения зубов.' },
    { en: 'DIGITAL DENTISTRY', ru: 'ЦИФРОВАЯ СТОМАТОЛОГИЯ' },
    { en: 'ORTHO CONCEPTS', ru: 'ОРТО КОНЦЕПЦИИ' },
    { en: 'ADVANCED PRACTICE', ru: 'ПРОДВИНУТАЯ ПРАКТИКА' },
    { en: 'Описание второго курса', ru: 'Описание второго курса' },
    { en: 'Description of the second course', ru: 'Описание второго курса' },
    { en: 'Описание третьего курса', ru: 'Описание третьего курса' },
    { en: 'Description of the third course', ru: 'Описание третьего курса' },
    { en: 'Описание четвертого курса', ru: 'Описание четвертого курса' },
    { en: 'Description of the fourth course', ru: 'Описание четвертого курса' },
    { en: 'ЗАПОЛНИТЕ ФОРМУ', ru: 'ЗАПОЛНИТЕ ФОРМУ' },
    { en: 'FILL OUT THE FORM', ru: 'ЗАПОЛНИТЕ ФОРМУ' },
    { en: 'и наши менеджеры позвонят вам для подробной консультации', ru: 'и наши менеджеры позвонят вам для подробной консультации' },
    { en: 'and our managers will call you for a detailed consultation', ru: 'и наши менеджеры позвонят вам для подробной консультации' },
    { en: 'ФИО', ru: 'ФИО' },
    { en: 'Full name', ru: 'ФИО' },
    { en: 'Комментарий', ru: 'Комментарий' },
    { en: 'Comment', ru: 'Комментарий' },
    { en: 'Отправить', ru: 'Отправить' },
    { en: 'Send', ru: 'Отправить' },
    { en: 'Ставя отметку, я даю свое согласие на обработку своих персональных данных.', ru: 'Ставя отметку, я даю свое согласие на обработку своих персональных данных.' },
    { en: 'By checking the box, I consent to the processing of my personal data.', ru: 'Ставя отметку, я даю свое согласие на обработку своих персональных данных.' },
    { en: 'ABOUT INTEGRAT', ru: 'ОБ INTEGRAT' },
    { en: 'OUR MISSION', ru: 'НАША МИССИЯ' },
    { en: 'We restore functional and bioesthetic harmony through a biologically driven, technology-enhanced approach, grounded in science and ethics.', ru: 'Мы восстанавливаем функциональную и биоэстетическую гармонию через биологически обоснованный, технологически усиленный подход, основанный на науке и этике.' },
    { en: 'OUR CLINIC PROVIDES CARE IN THREE MAIN TREATMENT DIRECTIONS:', ru: 'НАША КЛИНИКА РАБОТАЕТ В ТРЕХ ОСНОВНЫХ НАПРАВЛЕНИЯХ ЛЕЧЕНИЯ:' },
    { en: 'Interceptive treatment', ru: 'Интерцептивное лечение' },
    { en: 'Preventive treatment', ru: 'Профилактическое лечение' },
    { en: 'Reconstructive treatment', ru: 'Реконструктивное лечение' },
    { en: 'early detection of changes in the masticatory system in children to prevent the development of pathology.', ru: 'раннее выявление изменений в жевательной системе у детей для предотвращения развития патологии.' },
    { en: 'a set of measures aimed at preventing disorders in the dentoalveolar system.', ru: 'комплекс мер, направленных на предупреждение нарушений в зубочелюстной системе.' },
    { en: 'OUR CORE PRINCIPLE:', ru: 'НАШ КЛЮЧЕВОЙ ПРИНЦИП:' },
    { en: 'Patient-centered, optimal treatment — guided not by brands of brackets, aligners, or implants, but by biological limitations, sound biomechanics, and clear functional objectives.', ru: 'Оптимальное лечение, ориентированное на пациента, определяется не брендами брекетов, элайнеров или имплантов, а биологическими ограничениями, грамотной биомеханикой и ясными функциональными целями.' },
    { en: 'Patient-centered, optimal treatment — guided by biological limitations, sound biomechanics, and clear functional objectives.', ru: 'Оптимальное лечение, ориентированное на пациента, основано на биологических ограничениях, грамотной биомеханике и ясных функциональных целях.' },
    { en: 'Preventive Dentistry', ru: 'Профилактическая стоматология' },
    { en: 'Therapeutic Dentistry', ru: 'Терапевтическая стоматология' },
    { en: 'Prosthetics', ru: 'Протезирование' },
    { en: 'Implantology', ru: 'Имплантология' },
    { en: 'Orthodontics', ru: 'Ортодонтия' },
    { en: 'Aesthetic Dentistry', ru: 'Эстетическая стоматология' },
    { en: 'Periodontology', ru: 'Пародонтология' },
    { en: 'Pediatric Dentistry', ru: 'Детская стоматология' },
    { en: 'Preventive examinations, professional hygiene, fluoridation.', ru: 'Профилактические осмотры, профессиональная гигиена, фторирование.' },
    { en: 'Treatment of caries, pulpitis, filling.', ru: 'Лечение кариеса, пульпита, пломбирование.' },
    { en: 'Crowns, bridges, removable and non-removable prostheses.', ru: 'Коронки, мосты, съемные и несъемные протезы.' },
    { en: 'OUR DOCTORS', ru: 'НАШИ ВРАЧИ' },
    { en: 'All cases', ru: 'Все кейсы' },
    { en: 'Meet the Team', ru: 'Познакомиться с командой' },
    { en: 'Explore the artistry and precision behind our portfolio of timeless photography', ru: 'Откройте для себя мастерство и точность, стоящие за нашей визуальной историей и клинической эстетикой' },
    { en: 'TIME:', ru: 'ВРЕМЯ:' },
    { en: 'OUR TEAM', ru: 'НАША КОМАНДА' },
    { en: 'Architect of the clinic', ru: 'Архитектор клиники' },
    { en: 'Orthodontist', ru: 'Ортодонт' },
    { en: 'Back to', ru: 'Назад к' },
    { en: 'Email Address', ru: 'Электронная почта' },
    { en: 'Password', ru: 'Пароль' },
    { en: 'Sign In', ru: 'Войти' },
    { en: 'Confirm Password', ru: 'Подтвердите пароль' },
    { en: 'Register', ru: 'Регистрация' },
    { en: 'Min. 8 characters', ru: 'Мин. 8 символов' },
    { en: 'Back to Academy', ru: 'Назад в Academy' },
    { en: 'Admin Permissions', ru: 'Права администратора' },
    { en: 'Admin Confirmation', ru: 'Подтверждение администратором' },
    { en: 'Access Required', ru: 'Требуется доступ' },
    { en: 'You need an admin account to manage course permissions.', ru: 'Для управления доступом к курсам нужна учетная запись администратора.' },
    { en: 'You need an admin account to manage course payment requests.', ru: 'Для управления заявками на оплату нужна учетная запись администратора.' },
    { en: 'Open academy login', ru: 'Открыть вход Academy' },
    { en: 'Grant Video Access', ru: 'Выдать доступ к видео' },
    { en: 'Payment Requests', ru: 'Заявки на оплату' },
    { en: 'User Email', ru: 'Email пользователя' },
    { en: 'Course', ru: 'Курс' },
    { en: 'Note (optional)', ru: 'Примечание (необязательно)' },
    { en: 'Payment confirmed in CRM', ru: 'Оплата подтверждена в CRM' },
    { en: 'Grant Permission', ru: 'Выдать доступ' },
    { en: 'Registered Users', ru: 'Зарегистрированные пользователи' },
    { en: 'Current Grants', ru: 'Текущие доступы' },
    { en: 'Course Purchases', ru: 'Покупки курсов' },
    { en: 'Back to Site', ru: 'Назад на сайт' },
    { en: 'System Activity', ru: 'Активность системы' },
    { en: 'Total Contacts', ru: 'Всего заявок' },
    { en: 'Total Appointments', ru: 'Всего записей' },
    { en: 'Active Users', ru: 'Активные пользователи' },
    { en: 'Contact Form Requests', ru: 'Заявки с формы' },
    { en: 'Doctor Appointments', ru: 'Записи к врачу' },
    { en: 'Full Name', ru: 'ФИО' },
    { en: 'Phone', ru: 'Телефон' },
    { en: 'Date', ru: 'Дата' },
    { en: 'Date & Time', ru: 'Дата и время' },
    { en: 'Status', ru: 'Статус' },
    { en: 'Patient Email', ru: 'Email пациента' },
    { en: 'Doctor', ru: 'Врач' },
    { en: 'ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ ПО ЭНДОДОНТИИ. ЧАСТЬ I', ru: 'ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ ПО ЭНДОДОНТИИ. ЧАСТЬ I' },
    { en: 'FAQ IN ENDODONTICS. PART I', ru: 'ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ ПО ЭНДОДОНТИИ. ЧАСТЬ I' },
    { en: 'ЭФФЕКТИВНОЕ ЛЕЧЕНИЕ КОРНЕВЫХ КАНАЛОВ', ru: 'ЭФФЕКТИВНОЕ ЛЕЧЕНИЕ КОРНЕВЫХ КАНАЛОВ' },
    { en: 'EFFECTIVE ROOT CANAL TREATMENT', ru: 'ЭФФЕКТИВНОЕ ЛЕЧЕНИЕ КОРНЕВЫХ КАНАЛОВ' },
    { en: 'УЧАСТВОВАТЬ', ru: 'УЧАСТВОВАТЬ' },
    { en: 'Participate', ru: 'УЧАСТВОВАТЬ' },
    { en: 'Came in for a regular check-up and left with a brighter smile than ever. Quick, painless, and truly caring service.', ru: 'Пришел на обычный осмотр и ушел с самой яркой улыбкой. Быстро, безболезненно и по-настоящему заботливо.' },
    { en: 'Close modal', ru: 'Закрыть модальное окно' },
    { en: 'Back to home', ru: 'Назад на главную' },
    { en: 'Next-generation dental ecosystem focused on clinic care, doctors, and academy education.', ru: 'Стоматологическая экосистема нового поколения, объединяющая клинику, врачей и академическое обучение.' },
    { en: '© 2026 Integrat. All rights reserved.', ru: '© 2026 Integrat. Все права защищены.' }
  ];

  const defaultContact = {
    address: 'Astana, Mangilik El 36',
    phone: '+7 747 457 17 40',
    tel: '+77474571740',
    email: 'hello@integrat.kz',
    mapEmbedUrl: 'https://www.google.com/maps?q=Astana%20Mangilik%20El%2036&output=embed'
  };

  const defaultSocials = {
    instagram: '',
    telegram: '',
    whatsapp: 'https://wa.me/77474571740',
    google: 'https://maps.google.com/?q=Astana%20Mangilik%20El%2036'
  };

  const defaultSiteScope = {
    navItems: [
      { href: 'index.html', label: 'HOME' },
      { href: 'clinic.html', label: 'CLINIC' },
      { href: 'doctors.html', label: 'DOCTORS' },
      { href: 'academy.html', label: 'ACADEMY' },
      { href: 'about.html', label: 'ABOUT US' }
    ],
    activePages: ['index.html', 'clinic.html', 'doctors.html', 'academy.html', 'about.html'],
    archivedPages: ['laboratory.html', 'store.html'],
    footerTagline: 'Next-generation dental ecosystem focused on clinic care, doctors, and academy education.'
  };

  const defaultI18n = {
    defaultLang: storage.get('integrat.lang') || 'en',
    storageKey: 'integrat.lang',
    phrases: i18nPhrases
  };

  const config = {
    clinicApiBaseUrl:
      runtimeConfig.clinicApiBaseUrl ||
      storage.get('integrat.clinicApiBaseUrl') ||
      origin ||
      'http://127.0.0.1:3000',
    academyApiBaseUrl:
      runtimeConfig.academyApiBaseUrl ||
      storage.get('integrat.academyApiBaseUrl') ||
      origin ||
      'http://127.0.0.1:3000',
    contact: {
      ...defaultContact,
      ...(runtimeConfig.contact || {})
    },
    socials: {
      ...defaultSocials,
      ...(runtimeConfig.socials || {})
    },
    siteScope: {
      ...defaultSiteScope,
      ...(runtimeConfig.siteScope || {})
    },
    i18n: {
      ...defaultI18n,
      ...(runtimeConfig.i18n || {})
    }
  };

  windowObject.IntegratConfig = {
    ...(windowObject.IntegratConfig || {}),
    ...config
  };
})(window);
