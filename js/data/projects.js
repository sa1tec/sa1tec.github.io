// js/data/projects.js
// Единственный источник правды для секции Projects.
// HTML ничего не знает о проектах — всё генерируется render.js

export const projects = [
  {
    id: 'proj-01',
    title: 'Aurora OS',
    category: 'Product Design',
    year: '2025',
    status: 'В проде',
    description: 'Дизайн-система и интерфейс операционной панели нового поколения — от нуля до релиза за 6 месяцев.',
    longText: 'Aurora OS — попытка переосмыслить, как выглядит панель управления, когда данных слишком много, а внимания у человека слишком мало. Мы убрали 70% визуального шума, оставив только то, что двигает решения.',
    tech: ['TypeScript', 'WebGL', 'Figma', 'GSAP'],
    features: ['Живые графики на shader-based рендере', 'Тёмная тема по умолчанию', 'Адаптивная плотность интерфейса'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=70',
    video: '',
    github: 'https://github.com/',
    website: 'https://example.com/'
  },
  {
    id: 'proj-02',
    title: 'Nordlys',
    category: 'Brand & Web',
    year: '2024',
    status: 'Завершён',
    description: 'Цифровой бренд для скандинавского бюро архитекторов — сайт, отмеченный на трёх дизайн-конкурсах.',
    longText: 'Задача звучала просто: «сделайте, чтобы сайт молчал так же красиво, как их здания». Итог — минималистичная типографика, много воздуха и покадровая анимация фасадов при скролле.',
    tech: ['Three.js', 'Lenis', 'Webflow'],
    features: ['3D-модели зданий в реальном времени', 'Cinematic scroll-storytelling', 'Кастомная типографика'],
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=70',
    video: '',
    github: '',
    website: 'https://example.com/'
  },
  {
    id: 'proj-03',
    title: 'Lucid',
    category: 'Mobile App',
    year: '2024',
    status: 'Завершён',
    description: 'Приложение для осознанного сна: интерфейс, который успокаивает ещё до того, как вы начали им пользоваться.',
    longText: 'Каждая анимация в Lucid длиннее обычного на 30% — намеренно. Мы тестировали десятки таймингов, пока интерфейс не начал буквально замедлять пульс тестировщиков.',
    tech: ['SwiftUI', 'Lottie', 'Figma'],
    features: ['Генеративный звуковой фон', 'Плавные переходы между экранами', 'Адаптивная цветовая температура'],
    image: 'https://images.unsplash.com/photo-1495563889596-30fe95ea9df2?w=1200&q=70',
    video: '',
    github: '',
    website: ''
  },
  {
    id: 'proj-04',
    title: 'Vantage Point',
    category: 'Data Visualisation',
    year: '2023',
    status: 'Завершён',
    description: 'Интерактивная 3D-визуализация климатических данных для международной исследовательской группы.',
    longText: 'Полтора миллиона точек данных, один WebGL-канвас и требование — «должно летать даже на старом macbook». Оптимизация заняла больше времени, чем сама визуализация.',
    tech: ['Three.js', 'D3.js', 'GLSL'],
    features: ['Instanced rendering для 1.5М точек', 'Camera fly-through', 'Экспорт в 4K видео'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=70',
    video: '',
    github: 'https://github.com/',
    website: ''
  },
  {
    id: 'proj-05',
    title: 'Ember Studio',
    category: 'Design System',
    year: '2023',
    status: 'Завершён',
    description: 'Дизайн-система для креативного агентства с 40+ внутренними продуктами.',
    longText: 'До Ember у каждой команды была своя версия «того же самого» компонента. После — единый источник правды и минус 200 часов разработки в квартал.',
    tech: ['React', 'Storybook', 'Style Dictionary'],
    features: ['Токен-based тема', 'Авто-генерация документации', 'Двухнедельный онбординг вместо двухмесячного'],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&q=70',
    video: '',
    github: '',
    website: ''
  },
  {
    id: 'proj-06',
    title: 'Quiet Hours',
    category: 'Personal Project',
    year: '2022',
    status: 'Эксперимент',
    description: 'Личный эксперимент: сайт, который меняется в зависимости от времени суток пользователя.',
    longText: 'Никакого бизнес-смысла — чистое любопытство. Свет, музыка и даже шрифт на сайте подстраиваются под то, сколько сейчас времени у вас за окном.',
    tech: ['Vanilla JS', 'Web Audio API', 'CSS Houdini'],
    features: ['Динамическая палитра по времени суток', 'Процедурная музыка', 'Zero dependencies'],
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=70',
    video: '',
    github: 'https://github.com/',
    website: ''
  }
];
