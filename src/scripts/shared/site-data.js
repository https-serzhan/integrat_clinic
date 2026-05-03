(function bootstrapSiteData(globalScope, factory) {
  const data = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = data;
  }

  if (globalScope) {
    globalScope.IntegratSiteData = {
      ...(globalScope.IntegratSiteData || {}),
      ...data
    };
  }
})(typeof window !== 'undefined' ? window : globalThis, function createSiteData() {
  const images = {
    orange: '../../assets/images/orange-doctor.png',
    blue: '../../assets/images/blue-doctor.png',
    group: '../../assets/images/ph-integrat-group.png',
    treatments: '../../assets/images/treatments.png',
    hero: '../../assets/images/clinic-hero.svg',
    hall: '../../assets/images/hero-ph-integrat.svg',
    tooth: '../../assets/images/tooth-clinic.svg',
    coat: '../../assets/images/home-page-costume.svg',
    male1Portrait: '../../assets/images/male1_portrait.jpg',
    male2Portrait: '../../assets/images/male2_portrait.jpg',
    male3Portrait: '../../assets/images/male3_portrait.jpg',
    female1Portrait: '../../assets/images/female1_portrait.jpg',
    female2Portrait: '../../assets/images/female2_portrait.jpg',
    male1CaseOne: '../../assets/images/male1_cases_1.jpg',
    male1CaseTwo: '../../assets/images/male1_cases_2.jpg',
    male1CaseThree: '../../assets/images/male1_cases_3.jpg',
    male2CaseOne: '../../assets/images/male2_cases1.jpg',
    male2CaseTwo: '../../assets/images/male2_cases2.jpg',
    male2CaseThree: '../../assets/images/male2_cases3.jpg',
    male3CaseOne: '../../assets/images/male3_cases1.jpg',
    male3CaseTwo: '../../assets/images/male3_cases2.jpg',
    male3CaseThree: '../../assets/images/male3_cases3.jpg',
    female1CaseOne: '../../assets/images/female1_cases_1.jpg',
    female1CaseTwo: '../../assets/images/female1_cases_2.jpg',
    female1CaseThree: '../../assets/images/female1_cases_3.jpg',
    female2CaseOne: '../../assets/images/female2_cases_1.jpg',
    female2CaseTwo: '../../assets/images/female2_cases_2.jpg',
    female2CaseThree: '../../assets/images/female2_cases_3.jpg',
    lecturerMaleOne: '../../assets/images/male_lecturer.jpg',
    lecturerMaleTwo: '../../assets/images/male_lecturer_2.jpg',
    lecturerMaleThree: '../../assets/images/male_lecturer_3.jpg',
    lecturerFemaleOne: '../../assets/images/female_lecturer.jpg',
    lecturerFemaleTwo: '../../assets/images/female_lecturer_2.jpg',
    compensationOne: '../../assets/images/compensation_or_orthosurgery.png',
    compensationTwo: '../../assets/images/compensation_or_orthosurgery_2.png',
    maxillaryOne: '../../assets/images/maxillary_expansion_1.png',
    maxillaryTwo: '../../assets/images/maxillary_expansion_2.png',
    maxillaryThree: '../../assets/images/maxillary_expansion_3.png',
    maxillaryFinal: '../../assets/images/maxillary_expansion_final.png',
    retreatmentOne: '../../assets/images/orthodontic_retreatment_of_open_bite.png',
    retreatmentTwo: '../../assets/images/orthodontic_retreatment_of_open_bite_2.png',
    retreatmentThree: '../../assets/images/orthodontic_retreatment_of_open_bite_3.png',
    skeletalOne: '../../assets/images/skelet_extension_of_tooth_rows.png',
    skeletalTwo: '../../assets/images/skelet_extension_of_tooth_rows_2.png',
    skeletalFinal: '../../assets/images/skelet_extension_of_tooth_rows_final.png',
    singleToothOne: '../../assets/images/sometimes_one_tooth_can_cause_problem.png',
    singleToothTwo: '../../assets/images/sometimes_one_tooth_can_cause_problem_2.png',
    singleToothFinal: '../../assets/images/sometimes_one_tooth_can_cause_problem_final.png',
    uprightingOne: '../../assets/images/uprighting_stages1_2.png',
    uprightingTwo: '../../assets/images/uprighting_stages3_4.png',
    uprightingFinal: '../../assets/images/uprighting_without_side_effect.png'
  };

  const documents = {
    researchOne: '../../assets/images/research_1.pdf',
    researchTwo: '../../assets/images/research_2.pdf',
    researchThree: '../../assets/images/research_3.pdf',
    researchFour: '../../assets/images/research_4.pdf'
  };

  const media = {
    homeVideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  };

  function lesson(title, titleRu, typeOrOptions) {
    const options =
      typeof typeOrOptions === 'string'
        ? { type: typeOrOptions }
        : (typeOrOptions || {});

    return {
      title,
      title_ru: titleRu,
      type: options.type || 'video',
      resourceUrl: options.resourceUrl || null,
      resourceLabel: options.resourceLabel || 'Supporting material',
      resourceLabel_ru: options.resourceLabel_ru || options.resourceLabel || 'Дополнительный материал'
    };
  }

  function section(title, titleRu, lessons) {
    return {
      title,
      title_ru: titleRu,
      lessons
    };
  }

  function outline(title, titleRu, subtitle, subtitleRu, sections) {
    return {
      title,
      title_ru: titleRu,
      subtitle,
      subtitle_ru: subtitleRu,
      sections
    };
  }

  const doctors = [
    {
      id: 1,
      name: 'Dr. Aliya Kassymova',
      specialty: 'Aesthetic restorative dentistry',
      specialty_ru: 'Эстетическая реставрационная стоматология',
      categories: ['esthetic'],
      image: images.female1Portrait,
      cases: [images.female1CaseOne, images.female1CaseTwo, images.female1CaseThree],
      experience: 14,
      education: '2011 - Dentistry, Astana Medical University<br>2013 - Residency in prosthodontics and direct restorations',
      education_ru: '2011 - Стоматология, Astana Medical University<br>2013 - Резидентура по ортопедии и прямым реставрациям',
      spec: 'Veneers, full-smile planning, anterior composites, and interdisciplinary rehabilitation.',
      spec_ru: 'Виниры, планирование улыбки, прямые реставрации фронтальной группы и междисциплинарная реабилитация.'
    },
    {
      id: 2,
      name: 'Dr. Serzhan Sarsembayev',
      specialty: 'Orthodontics and occlusion',
      specialty_ru: 'Ортодонтия и окклюзия',
      categories: ['orthodontics'],
      image: images.male1Portrait,
      cases: [images.male1CaseOne, images.male1CaseTwo, images.male1CaseThree],
      experience: 11,
      education: '2013 - Dentistry, Karaganda Medical University<br>2016 - Fellowship in orthodontics and functional occlusion',
      education_ru: '2013 - Стоматология, Карагандинский медицинский университет<br>2016 - Стажировка по ортодонтии и функциональной окклюзии',
      spec: 'Aligners, skeletal planning, interdisciplinary bite correction, and retention protocols.',
      spec_ru: 'Элайнеры, скелетное планирование, междисциплинарная коррекция прикуса и протоколы ретенции.'
    },
    {
      id: 3,
      name: 'Dr. Madina Yesimova',
      specialty: 'Microscope endodontics',
      specialty_ru: 'Эндодонтия под микроскопом',
      categories: ['endodontics'],
      image: images.female2Portrait,
      cases: [images.female2CaseOne, images.female2CaseTwo, images.female2CaseThree],
      experience: 10,
      education: '2014 - Dentistry, KazNMU<br>2018 - Advanced endodontic training in rotary systems and microscope retreatment',
      education_ru: '2014 - Стоматология, КазНМУ<br>2018 - Продвинутое обучение по эндодонтии, ротационным системам и перелечиванию под микроскопом',
      spec: 'Primary endodontics, retreatment, calcified canals, and restorative sealing after endodontic therapy.',
      spec_ru: 'Первичная эндодонтия, перелечивание, кальцифицированные каналы и восстановление зуба после эндолечения.'
    },
    {
      id: 4,
      name: 'Dr. Timur Sadykov',
      specialty: 'Implantology and bone reconstruction',
      specialty_ru: 'Имплантология и костная реконструкция',
      categories: ['implants'],
      image: images.male2Portrait,
      cases: [images.male2CaseOne, images.male2CaseTwo, images.male2CaseThree],
      experience: 13,
      education: '2010 - Dentistry, West Kazakhstan Medical University<br>2015 - Oral surgery residency and implant fellowship',
      education_ru: '2010 - Стоматология, Западно-Казахстанский медицинский университет<br>2015 - Резидентура по хирургии и fellowship по имплантологии',
      spec: 'Single implants, full-arch planning, guided surgery, sinus lift, and ridge augmentation.',
      spec_ru: 'Одиночные импланты, full-arch планирование, навигационная хирургия, синус-лифтинг и аугментация гребня.'
    },
    {
      id: 5,
      name: 'Dr. Nurlan Beketov',
      specialty: 'Periodontics and soft-tissue care',
      specialty_ru: 'Пародонтология и мягкотканная пластика',
      categories: ['periodontics'],
      image: images.male3Portrait,
      cases: [images.male3CaseOne, images.male3CaseTwo, images.male3CaseThree],
      experience: 12,
      education: '2012 - Dentistry, South Kazakhstan Medical Academy<br>2016 - Soft-tissue management and periodontology fellowship',
      education_ru: '2012 - Стоматология, Южно-Казахстанская медицинская академия<br>2016 - Fellowship по пародонтологии и работе с мягкими тканями',
      spec: 'Gingival management, peri-implant tissue stability, crown lengthening, and maintenance programs.',
      spec_ru: 'Управление десневым контуром, стабильность тканей вокруг имплантов, удлинение клинической коронки и поддерживающие программы.'
    }
  ];

  const lecturers = [
    {
      id: 101,
      name: 'Dr. Serzhan Sarsembayev',
      specialty: 'Lecturer in orthodontic planning',
      specialty_ru: 'Лектор по ортодонтическому планированию',
      categories: ['orthodontics'],
      image: images.lecturerMaleOne,
      experience: 11,
      education: 'Clinical mentor for aligner systems, biomechanics, and interdisciplinary case finishing.',
      education_ru: 'Клинический ментор по элайнерам, биомеханике и междисциплинарному завершению случаев.',
      spec: 'Teaches digital setup review, anchorage strategy, and stable finishing protocols.',
      spec_ru: 'Преподает анализ цифровых сетапов, стратегию опоры и протоколы стабильного финиша.'
    },
    {
      id: 102,
      name: 'Dr. Madina Yesimova',
      specialty: 'Lecturer in clinical endodontics',
      specialty_ru: 'Лектор по клинической эндодонтии',
      categories: ['endodontics'],
      image: images.lecturerFemaleOne,
      experience: 10,
      education: 'Leads modules on diagnosis, access design, irrigation safety, and retreatment decision-making.',
      education_ru: 'Ведет модули по диагностике, дизайну доступа, безопасной ирригации и тактике перелечивания.',
      spec: 'Focuses on microscope workflows, troubleshooting, and predictable obturation.',
      spec_ru: 'Специализируется на работе под микроскопом, разборе осложнений и предсказуемой обтурации.'
    },
    {
      id: 103,
      name: 'Dr. Timur Sadykov',
      specialty: 'Lecturer in implant surgery',
      specialty_ru: 'Лектор по хирургической имплантологии',
      categories: ['implants'],
      image: images.lecturerMaleTwo,
      experience: 13,
      education: 'Supervises guided surgery, grafting protocols, and restorative-driven implant planning.',
      education_ru: 'Курирует навигационную хирургию, протоколы аугментации и ортопедически ориентированное планирование.',
      spec: 'Teaches CBCT interpretation, site development, and immediate provisional decision trees.',
      spec_ru: 'Преподает интерпретацию КЛКТ, подготовку ложа и алгоритмы немедленной временной нагрузки.'
    },
    {
      id: 104,
      name: 'Dr. Dana Omarova',
      specialty: 'Lecturer in digital prosthodontics',
      specialty_ru: 'Лектор по цифровой ортопедии',
      categories: ['digital'],
      image: images.lecturerFemaleTwo,
      experience: 8,
      education: 'Builds course tracks around scans, design communication, mockups, and restorative delivery.',
      education_ru: 'Формирует курсы по сканированию, коммуникации в дизайне, мокапам и выдаче реставраций.',
      spec: 'Focuses on CAD/CAM communication, preparation strategy, and high-conversion case presentation.',
      spec_ru: 'Делает акцент на коммуникации CAD/CAM, стратегии препарирования и презентации плана пациенту.'
    }
  ];

  const academyCourses = [
    {
      id: 'endo-faq',
      title: 'FAQ in Endodontics - Part I',
      title_ru: 'FAQ по эндодонтии - часть I',
      description: 'Case triage, access design, instrumentation logic, and complication control for daily endodontics.',
      description_ru: 'Сортировка случаев, дизайн доступа, логика инструментальной обработки и контроль осложнений в повседневной эндодонтии.',
      category: 'endodontics',
      badge: 'Best seller',
      badge_ru: 'Хит продаж',
      rating: '4.9',
      meta: 'Self-paced video course · Integrat Academy',
      meta_ru: 'Видеокурс в удобном темпе · Integrat Academy',
      price: '$139',
      priceValue: 139,
      priceLabel: '$139',
      priceSuffix: '/ access',
      priceSuffix_ru: '/ доступ',
      tags: ['Endodontics', 'Clinical FAQ'],
      tags_ru: ['Эндодонтия', 'Клинический FAQ'],
      images: [images.singleToothOne, images.singleToothTwo, images.singleToothFinal]
    },
    {
      id: 'implant-lab',
      title: 'Precision Implant Lab',
      title_ru: 'Точная имплантологическая лаборатория',
      description: 'Guided surgery planning, prosthetic sequencing, and clinic-lab communication for implant cases.',
      description_ru: 'Планирование навигационной хирургии, ортопедическая последовательность и коммуникация клиники с лабораторией при имплантации.',
      category: 'implants',
      badge: 'Hands-on',
      badge_ru: 'Практика',
      rating: '4.8',
      meta: '4-day intensive · Clinical mentor support',
      meta_ru: '4-дневный интенсив · Сопровождение ментора',
      price: '$259',
      priceValue: 259,
      priceLabel: '$259',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Implants', 'Guided workflow'],
      tags_ru: ['Имплантация', 'Навигационный протокол'],
      images: [images.compensationOne, images.compensationTwo, images.retreatmentOne]
    },
    {
      id: 'digital-smile',
      title: 'Digital Smile Workflow',
      title_ru: 'Цифровой протокол улыбки',
      description: 'From intraoral scan to mockup, presentation, and restorative execution in esthetic cases.',
      description_ru: 'От интраорального сканирования до мокапа, презентации и выполнения эстетических реставраций.',
      category: 'digital',
      badge: 'New',
      badge_ru: 'Новинка',
      rating: '4.8',
      meta: 'Workshop + templates · Guided execution',
      meta_ru: 'Воркшоп + шаблоны · Пошаговое выполнение',
      price: '$189',
      priceValue: 189,
      priceLabel: '$189',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Digital', 'Smile design'],
      tags_ru: ['Цифровая стоматология', 'Дизайн улыбки'],
      images: [images.uprightingOne, images.uprightingTwo, images.uprightingFinal]
    },
    {
      id: 'occlusion-protocols',
      title: 'Occlusion Protocols',
      title_ru: 'Протоколы окклюзии',
      description: 'Functional diagnosis, deprogramming, and interdisciplinary decisions for stable restorative cases.',
      description_ru: 'Функциональная диагностика, депрограммирование и междисциплинарные решения для стабильных реставрационных случаев.',
      category: 'occlusion',
      badge: 'Advanced',
      badge_ru: 'Продвинутый',
      rating: '4.9',
      meta: 'Case-based intensive · Mentor review',
      meta_ru: 'Интенсив на клинических кейсах · Разбор с ментором',
      price: '$229',
      priceValue: 229,
      priceLabel: '$229',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Occlusion', 'Interdisciplinary'],
      tags_ru: ['Окклюзия', 'Междисциплинарный подход'],
      images: [images.maxillaryOne, images.maxillaryTwo, images.maxillaryFinal]
    },
    {
      id: 'perio-blueprint',
      title: 'Perio Stability Blueprint',
      title_ru: 'План стабильности пародонта',
      description: 'Soft-tissue phenotype, periodontal sequencing, and maintenance systems before restorative care.',
      description_ru: 'Биотип мягких тканей, последовательность пародонтологического лечения и поддерживающие системы перед реставрацией.',
      category: 'periodontics',
      badge: 'Clinical system',
      badge_ru: 'Клиническая система',
      rating: '4.7',
      meta: '2-day lecture · Protocol pack included',
      meta_ru: '2-дневный курс · В комплекте протоколы',
      price: '$169',
      priceValue: 169,
      priceLabel: '$169',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Periodontics', 'Tissue management'],
      tags_ru: ['Пародонтология', 'Работа с тканями'],
      images: [images.retreatmentOne, images.retreatmentTwo, images.retreatmentThree]
    },
    {
      id: 'pediatric-chairside',
      title: 'Pediatric Chairside Flow',
      title_ru: 'Детский прием без стресса',
      description: 'Behavior guidance, preventive planning, and minimally invasive treatment flow for children.',
      description_ru: 'Поведенческое сопровождение, профилактическое планирование и малоинвазивный детский прием.',
      category: 'pediatric',
      badge: 'Practice-ready',
      badge_ru: 'Готово к практике',
      rating: '4.8',
      meta: 'Team training · Communication scripts',
      meta_ru: 'Командное обучение · Скрипты коммуникации',
      price: '$149',
      priceValue: 149,
      priceLabel: '$149',
      priceSuffix: '/ access',
      priceSuffix_ru: '/ доступ',
      tags: ['Pediatric', 'Communication'],
      tags_ru: ['Детская стоматология', 'Коммуникация'],
      images: [images.singleToothOne, images.singleToothTwo, images.retreatmentTwo]
    },
    {
      id: 'anterior-composites',
      title: 'Anterior Composite Layering',
      title_ru: 'Послойная реставрация фронтальной группы',
      description: 'Shade mapping, morphology, isolation, and finishing protocols for everyday esthetic composites.',
      description_ru: 'Карта оттенков, морфология, изоляция и протоколы финишной обработки для эстетических композитных реставраций.',
      category: 'restorative',
      badge: 'High demand',
      badge_ru: 'Высокий спрос',
      rating: '4.9',
      meta: 'Live demo + checklists',
      meta_ru: 'Живая демонстрация + чек-листы',
      price: '$179',
      priceValue: 179,
      priceLabel: '$179',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Restorative', 'Aesthetics'],
      tags_ru: ['Реставрация', 'Эстетика'],
      images: [images.compensationOne, images.compensationTwo, images.uprightingFinal]
    },
    {
      id: 'aligner-planning',
      title: 'Aligner Case Planning',
      title_ru: 'Планирование лечения на элайнерах',
      description: 'Setup review, attachments, staging, and patient communication for predictable aligner cases.',
      description_ru: 'Проверка сетапа, аттачменты, стадийность и коммуникация с пациентом для предсказуемых кейсов на элайнерах.',
      category: 'orthodontics',
      badge: 'Mentor-led',
      badge_ru: 'С ментором',
      rating: '4.8',
      meta: 'Treatment planning bootcamp · 3 sessions',
      meta_ru: 'Интенсив по планированию · 3 сессии',
      price: '$199',
      priceValue: 199,
      priceLabel: '$199',
      priceSuffix: '/ seat',
      priceSuffix_ru: '/ место',
      tags: ['Orthodontics', 'Aligners'],
      tags_ru: ['Ортодонтия', 'Элайнеры'],
      images: [images.skeletalOne, images.skeletalTwo, images.skeletalFinal]
    }
  ];

  const academyVideoCatalog = {
    'endo-faq': outline(
      'FAQ in Endodontics - Part I',
      'FAQ по эндодонтии - часть I',
      'Clinical decision-making for daily endodontics',
      'Клинические решения для повседневной эндодонтии',
      [
        section('Module 1 · Diagnosis and access', 'Модуль 1 · Диагностика и доступ', [
          lesson('Case selection and pre-op checklist', 'Отбор случая и предоперационный чек-лист'),
          lesson('Access cavity strategy', 'Стратегия формирования доступа'),
          lesson('Complication prevention checklist', 'Чек-лист профилактики осложнений', {
            type: 'resource',
            resourceUrl: documents.researchOne,
            resourceLabel: 'Clinical reading PDF',
            resourceLabel_ru: 'PDF с клиническим чтением'
          })
        ]),
        section('Module 2 · Instrumentation', 'Модуль 2 · Инструментация', [
          lesson('Working length control', 'Контроль рабочей длины'),
          lesson('Irrigation sequence and safety', 'Последовательность ирригации и безопасность')
        ]),
        section('Module 3 · Obturation and follow-up', 'Модуль 3 · Обтурация и наблюдение', [
          lesson('Obturation decision tree', 'Дерево решений для обтурации'),
          lesson('Follow-up protocol', 'Протокол наблюдения', {
            type: 'resource',
            resourceUrl: documents.researchTwo,
            resourceLabel: 'Follow-up checklist PDF',
            resourceLabel_ru: 'PDF с чек-листом наблюдения'
          })
        ])
      ]
    ),
    'implant-lab': outline(
      'Precision Implant Lab',
      'Точная имплантологическая лаборатория',
      'Guided implant workflow from planning to restoration',
      'Навигационный имплантологический протокол от планирования до реставрации',
      [
        section('Module 1 · Digital planning', 'Модуль 1 · Цифровое планирование', [
          lesson('CBCT and intraoral scan alignment', 'Совмещение КЛКТ и интраорального скана'),
          lesson('Surgical guide checkpoints', 'Контрольные точки хирургического шаблона', {
            type: 'resource',
            resourceUrl: documents.researchThree,
            resourceLabel: 'Guide verification PDF',
            resourceLabel_ru: 'PDF с проверкой шаблона'
          })
        ]),
        section('Module 2 · Surgical execution', 'Модуль 2 · Хирургический этап', [
          lesson('Site preparation and drill sequence', 'Подготовка ложа и последовательность сверления'),
          lesson('Immediate provisional decision tree', 'Алгоритм немедленной временной нагрузки')
        ]),
        section('Module 3 · Restorative handoff', 'Модуль 3 · Передача на ортопедический этап', [
          lesson('Lab communication sheet', 'Форма передачи в лабораторию', {
            type: 'resource',
            resourceUrl: documents.researchFour,
            resourceLabel: 'Lab handoff PDF',
            resourceLabel_ru: 'PDF для передачи в лабораторию'
          }),
          lesson('Emergence profile control', 'Контроль профиля прорезывания')
        ])
      ]
    ),
    'digital-smile': outline(
      'Digital Smile Workflow',
      'Цифровой протокол улыбки',
      'Scan, design, mockup, and esthetic case presentation',
      'Сканирование, дизайн, мокап и презентация эстетического случая',
      [
        section('Module 1 · Scan and records', 'Модуль 1 · Сканирование и документация', [
          lesson('Photo and video records for design', 'Фото- и видеодокументация для дизайна'),
          lesson('Intraoral scan checkpoints', 'Контрольные точки интраорального сканирования')
        ]),
        section('Module 2 · Design and mockup', 'Модуль 2 · Дизайн и мокап', [
          lesson('Digital smile proposal', 'Цифровое предложение улыбки'),
          lesson('Mockup transfer protocol', 'Протокол переноса мокапа')
        ]),
        section('Module 3 · Patient communication', 'Модуль 3 · Коммуникация с пациентом', [
          lesson('Case presentation script', 'Скрипт презентации случая', {
            type: 'resource',
            resourceUrl: documents.researchOne,
            resourceLabel: 'Presentation script PDF',
            resourceLabel_ru: 'PDF со скриптом презентации'
          }),
          lesson('Approval and consent flow', 'Согласование плана и маршрута лечения')
        ])
      ]
    ),
    'occlusion-protocols': outline(
      'Occlusion Protocols',
      'Протоколы окклюзии',
      'Functional diagnosis and stability for restorative treatment',
      'Функциональная диагностика и стабильность для реставрационного лечения',
      [
        section('Module 1 · Functional records', 'Модуль 1 · Функциональные записи', [
          lesson('History, symptoms, and red flags', 'Анамнез, симптомы и тревожные признаки'),
          lesson('Deprogramming workflow', 'Протокол депрограммирования')
        ]),
        section('Module 2 · Planning stable contacts', 'Модуль 2 · Планирование стабильных контактов', [
          lesson('Centric relation checkpoints', 'Контрольные точки центрального соотношения'),
          lesson('Wax-up communication sheet', 'Форма коммуникации для wax-up', {
            type: 'resource',
            resourceUrl: documents.researchTwo,
            resourceLabel: 'Wax-up planning PDF',
            resourceLabel_ru: 'PDF по планированию wax-up'
          })
        ]),
        section('Module 3 · Interdisciplinary execution', 'Модуль 3 · Междисциплинарное выполнение', [
          lesson('Orthodontic-restorative sequencing', 'Последовательность ортодонтического и реставрационного этапов'),
          lesson('Maintenance and follow-up', 'Поддержание результата и наблюдение')
        ])
      ]
    ),
    'perio-blueprint': outline(
      'Perio Stability Blueprint',
      'План стабильности пародонта',
      'Soft-tissue assessment before restorative and implant care',
      'Оценка мягких тканей перед реставрационным и имплантологическим лечением',
      [
        section('Module 1 · Tissue diagnosis', 'Модуль 1 · Диагностика тканей', [
          lesson('Phenotype and recession mapping', 'Карта биотипа и рецессий'),
          lesson('Inflammation control sequence', 'Последовательность контроля воспаления')
        ]),
        section('Module 2 · Surgical and non-surgical strategy', 'Модуль 2 · Хирургическая и нехирургическая тактика', [
          lesson('Maintenance scheduling', 'Планирование поддерживающих визитов', {
            type: 'resource',
            resourceUrl: documents.researchThree,
            resourceLabel: 'Maintenance protocol PDF',
            resourceLabel_ru: 'PDF с протоколом поддержания'
          }),
          lesson('Soft-tissue correction planning', 'Планирование мягкотканной коррекции')
        ])
      ]
    ),
    'pediatric-chairside': outline(
      'Pediatric Chairside Flow',
      'Детский прием без стресса',
      'Behavior guidance and minimally invasive pediatric treatment',
      'Поведенческое сопровождение и малоинвазивное детское лечение',
      [
        section('Module 1 · First contact and adaptation', 'Модуль 1 · Первый контакт и адаптация', [
          lesson('Parent communication script', 'Скрипт общения с родителями', {
            type: 'resource',
            resourceUrl: documents.researchFour,
            resourceLabel: 'Parent communication PDF',
            resourceLabel_ru: 'PDF для общения с родителями'
          }),
          lesson('Tell-show-do workflow', 'Протокол tell-show-do')
        ]),
        section('Module 2 · Prevention and treatment', 'Модуль 2 · Профилактика и лечение', [
          lesson('Sealants and fluoride planning', 'Планирование герметизации и фторирования'),
          lesson('Minimal intervention treatment flow', 'Протокол минимального вмешательства')
        ])
      ]
    ),
    'anterior-composites': outline(
      'Anterior Composite Layering',
      'Послойная реставрация фронтальной группы',
      'Predictable esthetic composites for daily practice',
      'Предсказуемые эстетические композиты для ежедневной практики',
      [
        section('Module 1 · Color and shape', 'Модуль 1 · Цвет и форма', [
          lesson('Shade selection protocol', 'Протокол выбора оттенка'),
          lesson('Morphology map', 'Карта морфологии', {
            type: 'resource',
            resourceUrl: documents.researchOne,
            resourceLabel: 'Morphology map PDF',
            resourceLabel_ru: 'PDF с картой морфологии'
          })
        ]),
        section('Module 2 · Layering execution', 'Модуль 2 · Выполнение послойной техники', [
          lesson('Isolation and matrix strategy', 'Изоляция и матричная стратегия'),
          lesson('Texture and final polish', 'Текстура и финальная полировка')
        ])
      ]
    ),
    'aligner-planning': outline(
      'Aligner Case Planning',
      'Планирование лечения на элайнерах',
      'From digital setup review to patient delivery',
      'От анализа цифрового сетапа до выдачи пациенту',
      [
        section('Module 1 · Setup review', 'Модуль 1 · Анализ сетапа', [
          lesson('Case selection criteria', 'Критерии отбора случаев'),
          lesson('Attachment strategy', 'Стратегия аттачментов')
        ]),
        section('Module 2 · Staging and monitoring', 'Модуль 2 · Стадийность и контроль', [
          lesson('Movement staging checklist', 'Чек-лист стадийности перемещений', {
            type: 'resource',
            resourceUrl: documents.researchTwo,
            resourceLabel: 'Movement staging PDF',
            resourceLabel_ru: 'PDF со стадийностью перемещений'
          }),
          lesson('Refinement triggers', 'Показания к refinement')
        ]),
        section('Module 3 · Patient communication', 'Модуль 3 · Коммуникация с пациентом', [
          lesson('Consent and expectations', 'Согласие и ожидания пациента'),
          lesson('Compliance support system', 'Система поддержки комплаенса')
        ])
      ]
    )
  };

  return {
    doctors,
    lecturers,
    academyCourses,
    academyVideoCatalog,
    media
  };
});
