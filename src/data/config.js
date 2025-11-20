// Configuración general del UCSP Algorithm
// Textos, mensajes, secciones y configuración de UI

// ============================================================================
// BRAND CONFIGURATION - Configuración de marca
// ============================================================================
export const BRAND_CONFIG = {
  name: 'UCSP Algorithm',
  tagline: 'Social Intelligence para Universidad Católica San Pablo',
  subtitle: 'Optimización automática de inversión digital en admisiones',
  product: 'Pregrado y Posgrado 2025-I',
  market: 'Sur del Perú (Arequipa, Puno, Cusco, Moquegua, Tacna)',
  client: 'Universidad Católica San Pablo',
  version: '1.0.0',
};

// ============================================================================
// LAYER TITLES - Títulos y descripciones de las 4 capas
// ============================================================================
export const LAYER_CONFIG = {
  data: {
    id: 'data',
    name: 'Captura de Señales',
    subtitle: 'Monitoreo en tiempo real del ecosistema digital educativo',
    description: 'Búsqueda, Tendencia, Intención, Emoción',
    icon: 'Search',
    color: 'from-ucsp-darkBlue to-ucsp-blue', // #002453 → #003B7A
  },
  decision: {
    id: 'decision',
    name: 'Inteligencia de Mercado',
    subtitle: 'Insights automáticos para optimizar inversión en admisiones',
    description: 'Análisis y definición de estrategia',
    icon: 'Target',
    color: 'from-ucsp-blue to-ucsp-lightBlue', // #003B7A → #0056A3 (conecta con data)
  },
  execution: {
    id: 'execution',
    name: 'Activación Estratégica',
    subtitle: 'Distribución inteligente de presupuesto y contenidos',
    description: 'Implementación en tiempo real',
    icon: 'Zap',
    color: 'from-ucsp-lightBlue to-ucsp-burgundy', // #0056A3 → #6B1B3D (conecta con decision)
  },
  optimization: {
    id: 'optimization',
    name: 'Performance & Optimización',
    subtitle: 'Resultados en tiempo real y ajustes automáticos',
    description: 'Evaluación y redistribución',
    icon: 'TrendingUp',
    color: 'from-ucsp-burgundy to-ucsp-gold', // #6B1B3D → #C5A572 (conecta con execution)
  },
};

// ============================================================================
// KEY MESSAGES - Mensajes clave de comunicación UCSP
// ============================================================================
export const KEY_MESSAGES = {
  licenciamiento: {
    title: 'Universidad Licenciada',
    message: 'Primera universidad licenciada de Arequipa y el sur del Perú',
    description: 'Licenciamiento SUNEDU desde 2017, calidad garantizada',
  },
  formacion: {
    title: 'Formación Integral',
    message: 'Formación humanística y profesional de excelencia',
    description: 'Educación católica con visión de servicio',
  },
  acreditacion: {
    title: 'Acreditación Internacional',
    message: 'Carreras acreditadas por SINEACE, ICACIT e IAC-CINDA',
    description: 'Calidad académica reconocida internacionalmente',
  },
  tecnologia: {
    title: 'Innovación y Tecnología',
    message: 'Nuevas carreras: Ciencia de Datos e IA',
    description: 'Arequipa como hub digital del sur del Perú',
  },
  valores: {
    title: 'Valores Católicos',
    message: 'Comunidad universitaria con identidad católica',
    description: 'Centralidad de la persona y búsqueda de la verdad',
  },
};

// ============================================================================
// DATA SOURCES - Configuración de fuentes de datos
// ============================================================================
export const DATA_SOURCES_CONFIG = {
  googleTrends: {
    enabled: true,
    name: 'Google Trends',
    description: 'Tendencias de búsqueda en tiempo real',
    icon: 'TrendingUp',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    region: 'PE',
    category: 'Education',
    interval: 'hourly',
    status: 'active',
    geo: ['Arequipa', 'Puno', 'Cusco', 'Moquegua', 'Tacna'],
  },
  tiktok: {
    enabled: true,
    name: 'TikTok',
    description: 'Hashtags y contenido viral educativo',
    icon: 'Video',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    scraping: 'public',
    status: 'active',
  },
  meta: {
    enabled: true,
    name: 'Meta Platforms',
    description: 'Facebook e Instagram insights',
    icon: 'Share2',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    platforms: ['Facebook', 'Instagram'],
    status: 'active',
  },
  youtube: {
    enabled: true,
    name: 'YouTube',
    description: 'Videos y testimoniales universitarios',
    icon: 'Youtube',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    status: 'active',
  },
  education: {
    enabled: true,
    name: 'Portales Educativos',
    description: 'Ponte en Carrera, Estudia Perú, SUNEDU',
    icon: 'Globe',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    sources: ['Ponte en Carrera', 'Estudia Perú', 'SUNEDU'],
    status: 'active',
  },
  ga4: {
    enabled: false,
    name: 'Google Analytics 4',
    description: 'Tráfico web y conversiones',
    icon: 'BarChart3',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    mock_data: true,
    status: 'active',
  },
};

// ============================================================================
// CHANNELS - Canales de activación (sin LinkedIn ni TikTok Ads)
// ============================================================================
export const CHANNELS_CONFIG = {
  google_search: {
    name: 'Google Search',
    icon: 'Search',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    primary_kpi: 'Postulaciones calificadas',
    description: 'Intención de búsqueda alta',
  },
  meta_ads: {
    name: 'Meta Ads',
    icon: 'Share2',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    primary_kpi: 'Alcance + Engagement',
    description: 'Facebook e Instagram',
    subchannels: ['Lead Ads', 'Conversaciones WhatsApp', 'Visitas Landing'],
  },
  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    primary_kpi: 'View-through rate',
    description: 'Video pre-roll y discovery',
  },
  display: {
    name: 'Display Network',
    icon: 'Monitor',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    primary_kpi: 'Brand Awareness',
    description: 'Red de display de Google',
  },
};

// ============================================================================
// AUDIENCES - Audiencias objetivo (Pregrado y Posgrado)
// ============================================================================
export const TARGET_AUDIENCES = [
  {
    id: 'pregrado',
    name: 'Postulantes Pregrado',
    description: '17-25 años, estudiantes y bachilleres',
    size: '~10,500',
    age_range: '17-25',
    priority: 'high',
    segments: [
      {
        name: 'Escolares 5to Secundaria',
        size: '~8,000',
        age: '17-18',
        characteristics: ['Primera elección universitaria', 'Alto engagement redes', 'Influenciados por padres'],
      },
      {
        name: 'Bachilleres y Trabajadores',
        size: '~2,500',
        age: '19-25',
        characteristics: ['Traslados externos', 'Retorno a estudios', 'Mayor autonomía decisión'],
      },
    ],
    interests: ['Carreras demandadas', 'Becas', 'Vida universitaria', 'Acreditación'],
    message: 'Tu futuro empieza aquí: formación humanista y excelencia académica',
    channels: {
      'Meta Ads': 35,
      'Google Search': 30,
      'YouTube': 20,
      'Display': 15,
    },
    engagement_rate: 12.5,
    cpl_target: 9.5, // USD costo por lead objetivo
    conversion_funnel: {
      alcance: 850000,
      visitas_landing: 12000,
      formularios: 3000,
      postulaciones: 1050,
      matriculados: 240,
    },
  },
  {
    id: 'posgrado',
    name: 'Postulantes Posgrado',
    description: '25-45 años, profesionales',
    size: '~3,000',
    age_range: '25-45',
    priority: 'medium',
    segments: [
      {
        name: 'Profesionales Jóvenes',
        size: '~1,800',
        age: '25-32',
        characteristics: ['Primera maestría', 'Crecimiento profesional', 'Equilibrio trabajo-estudio'],
      },
      {
        name: 'Profesionales Establecidos',
        size: '~1,200',
        age: '33-45',
        characteristics: ['Especialización', 'Cambio de carrera', 'Alta exigencia académica'],
      },
    ],
    interests: ['Maestrías', 'Diplomados', 'MBA', 'Horarios flexibles', 'Acreditación'],
    message: '5 maestrías y diplomados con acreditación internacional',
    channels: {
      'Google Search': 40,
      'Meta Ads': 35,
      'YouTube': 15,
      'Display': 10,
    },
    engagement_rate: 8.5,
    cpl_target: 17.5, // USD costo por lead objetivo (más alto que pregrado)
    conversion_funnel: {
      alcance: 120000,
      visitas_landing: 4500,
      formularios: 850,
      postulaciones: 280,
      matriculados: 85,
    },
  },
];

// ============================================================================
// TIMING - Mejores momentos para pauta
// ============================================================================
export const OPTIMAL_TIMING = {
  dayparts: [
    { name: 'Mañana', hours: '7:00 - 9:00', performance: 'high', multiplier: 1.3, audience: 'Pregrado y Posgrado' },
    { name: 'Mediodía', hours: '12:00 - 14:00', performance: 'medium', multiplier: 1.0, audience: 'Pregrado' },
    { name: 'Tarde', hours: '18:00 - 21:00', performance: 'high', multiplier: 1.4, audience: 'Pregrado y Posgrado' },
    { name: 'Noche', hours: '21:00 - 23:00', performance: 'medium', multiplier: 1.1, audience: 'Posgrado' },
  ],
  weekdays: [
    { name: 'Lunes', performance: 'high', recommended: true },
    { name: 'Martes', performance: 'high', recommended: true },
    { name: 'Miércoles', performance: 'medium', recommended: true },
    { name: 'Jueves', performance: 'high', recommended: true },
    { name: 'Viernes', performance: 'medium', recommended: false },
    { name: 'Sábado', performance: 'low', recommended: false },
    { name: 'Domingo', performance: 'medium', recommended: false },
  ],
  events: [
    'Inicio campaña admisión (Enero-Febrero)',
    'Exámenes de admisión (Marzo-Abril)',
    'Fiestas Patrias (Julio)',
    'Campaña admisión II (Agosto-Septiembre)',
    'Charlas vocacionales (Todo el año)',
  ],
  geographies: [
    { city: 'Arequipa', hours: '7-9 AM, 18-21 PM', multiplier: 1.4, focus: 70 },
    { city: 'Puno/Juliaca', hours: '19-21 PM', multiplier: 1.5, focus: 18 },
    { city: 'Cusco', hours: '18-20 PM', multiplier: 1.3, focus: 10 },
    { city: 'Moquegua', hours: '19-21 PM', multiplier: 1.2, focus: 1 },
    { city: 'Tacna', hours: '19-21 PM', multiplier: 1.2, focus: 1 },
  ],
};

// ============================================================================
// METRIC CARDS - Configuración de tarjetas métricas principales
// ============================================================================
export const METRIC_CARDS_CONFIG = [
  {
    id: 'postulaciones',
    title: 'Postulaciones Completadas',
    description: 'Postulaciones válidas y calificadas',
    icon: 'Target',
    color: 'ucsp-blue',
    gradient: 'from-ucsp-blue to-ucsp-lightBlue',
  },
  {
    id: 'reach',
    title: 'Alcance Total',
    description: 'Usuarios únicos impactados en zonas objetivo',
    icon: 'Users',
    color: 'ucsp-burgundy',
    gradient: 'from-ucsp-burgundy to-ucsp-wine',
  },
  {
    id: 'engagement',
    title: 'Interacciones',
    description: 'Likes, shares, comentarios, saves',
    icon: 'Heart',
    color: 'ucsp-gold',
    gradient: 'from-ucsp-gold to-ucsp-burgundy',
  },
  {
    id: 'opportunity',
    title: 'UCSP Opportunity Score',
    description: 'Índice de oportunidad de inversión en admisiones',
    icon: 'Zap',
    color: 'ucsp-blue',
    gradient: 'from-ucsp-blue to-ucsp-darkBlue',
  },
];

// ============================================================================
// HUBSPOT INTEGRATION - Configuración de HubSpot
// ============================================================================
export const HUBSPOT_CONFIG = {
  enabled: false, // Cambiar a true cuando se integre API real
  api_key: null,
  endpoints: {
    campaigns: '/marketing/v3/campaigns',
    contacts: '/crm/v3/objects/contacts',
    analytics: '/analytics/v2/reports',
  },
  cpl_thresholds: {
    pregrado: {
      max_cpl: 12, // USD máximo por lead pregrado
      alert_at: 10, // Alerta cuando se acerca al límite
      pause_at: 14, // Pausar si supera este valor
    },
    posgrado: {
      max_cpl: 15,
      alert_at: 13,
      pause_at: 17,
    },
  },
  conversion_tracking: {
    lead_ads: true,
    whatsapp_conversations: true,
    landing_page_visits: true,
    form_submissions: true,
  },
  alerts: {
    email: true,
    webhook: false,
    dashboard: true,
  },
};

// ============================================================================
// UI TEXT - Textos de interfaz
// ============================================================================
export const UI_TEXT = {
  loading: 'Cargando UCSP Algorithm...',
  lastUpdate: 'Última actualización',
  systemActive: 'Sistema activo',
  noData: 'No hay datos disponibles',
  error: 'Error al cargar datos',
  retry: 'Reintentar',

  // Footer
  footer: {
    copyright: '© 2025 UCSP Algorithm - Universidad Católica San Pablo',
    version: 'v1.0.0',
  },

  // Buttons
  buttons: {
    viewDetails: 'Ver detalles',
    export: 'Exportar',
    refresh: 'Actualizar',
    filter: 'Filtrar',
    expandAll: 'Mostrar todas las carreras',
    collapseAll: 'Mostrar solo top 5',
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================
export default {
  BRAND_CONFIG,
  LAYER_CONFIG,
  KEY_MESSAGES,
  DATA_SOURCES_CONFIG,
  CHANNELS_CONFIG,
  TARGET_AUDIENCES,
  OPTIMAL_TIMING,
  METRIC_CARDS_CONFIG,
  HUBSPOT_CONFIG,
  UI_TEXT,
};
