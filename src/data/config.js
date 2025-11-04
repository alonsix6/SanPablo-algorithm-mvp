// Configuración general del Toyota Algorithm
// Textos, mensajes, secciones y configuración de UI

// ============================================================================
// BRAND CONFIGURATION - Configuración de marca
// ============================================================================
export const BRAND_CONFIG = {
  name: 'Toyota Algorithm',
  tagline: 'Social Intelligence para RAV4 Híbrida',
  subtitle: 'Optimización automática de inversión digital',
  product: 'Toyota RAV4 Híbrida 2025/2026',
  market: 'Perú',
  client: 'Reset - Agencia de Medios',
  version: '1.0.0',
};

// ============================================================================
// LAYER TITLES - Títulos y descripciones de las 4 capas
// ============================================================================
export const LAYER_CONFIG = {
  data: {
    id: 'data',
    name: 'Captura de Señales',
    subtitle: 'Monitoreo en tiempo real del ecosistema digital automotriz',
    description: 'Búsqueda, Tendencia, Intención, Emoción',
    icon: 'Search',
    color: 'from-toyota-red to-toyota-darkRed',
  },
  decision: {
    id: 'decision',
    name: 'Inteligencia de Mercado',
    subtitle: 'Insights automáticos para optimizar inversión',
    description: 'Análisis y definición de estrategia',
    icon: 'Target',
    color: 'from-toyota-darkRed to-toyota-gray',
  },
  execution: {
    id: 'execution',
    name: 'Activación Estratégica',
    subtitle: 'Distribución inteligente de presupuesto y contenidos',
    description: 'Implementación en tiempo real',
    icon: 'Zap',
    color: 'from-toyota-gray to-toyota-green',
  },
  optimization: {
    id: 'optimization',
    name: 'Performance & Optimización',
    subtitle: 'Resultados en tiempo real y ajustes automáticos',
    description: 'Evaluación y redistribución',
    icon: 'TrendingUp',
    color: 'from-toyota-green to-toyota-red',
  },
};

// ============================================================================
// KEY MESSAGES - Mensajes clave de comunicación RAV4
// ============================================================================
export const KEY_MESSAGES = {
  hybrid: {
    title: 'Eficiencia Híbrida',
    message: 'La eficiencia del híbrido, la libertad de Toyota',
    description: 'Tecnología que te lleva más lejos con menos',
  },
  family: {
    title: 'Seguridad Familiar',
    message: 'Más espacio, más seguridad, más tranquilidad',
    description: 'Protegemos lo que más importa',
  },
  adventure: {
    title: 'Aventura 4x4',
    message: 'Conquista la ciudad y escapa los fines de semana',
    description: 'Libertad sin límites',
  },
  sustainability: {
    title: 'Movilidad Sostenible',
    message: 'Movilidad inteligente para un Perú sostenible',
    description: 'El futuro es verde',
  },
  technology: {
    title: 'Tecnología Toyota',
    message: 'Innovación que se siente en cada kilómetro',
    description: 'Toyota Safety Sense y más',
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
    category: 'Autos & Vehicles',
    interval: 'hourly',
    status: 'active',
  },
  tiktok: {
    enabled: true,
    name: 'TikTok Creative Center',
    description: 'Hashtags y contenido viral',
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
    description: 'Videos y reviews automotrices',
    icon: 'Youtube',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    status: 'active',
  },
  automotive: {
    enabled: true,
    name: 'Portales Automotrices',
    description: 'Neoauto, Autocosmos, Motor1',
    icon: 'Globe',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    sources: ['Neoauto', 'Autocosmos', 'Motor1'],
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
// CHANNELS - Canales de activación
// ============================================================================
export const CHANNELS_CONFIG = {
  google_search: {
    name: 'Google Search',
    icon: 'Search',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    primary_kpi: 'Leads calificados',
    description: 'Intención de compra alta',
  },
  social_media: {
    name: 'Meta Ads',
    icon: 'Share2',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    primary_kpi: 'Alcance + Engagement',
    description: 'Facebook e Instagram',
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
  tiktok: {
    name: 'TikTok Ads',
    icon: 'Video',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    primary_kpi: 'Testing formatos',
    description: 'Nuevas audiencias',
  },
};

// ============================================================================
// AUDIENCES - Audiencias objetivo
// ============================================================================
export const TARGET_AUDIENCES = [
  {
    id: 'young-families',
    name: 'Familias Jóvenes',
    description: '30-45 años, con hijos',
    size: '~450K',
    priority: 'high',
    interests: ['Seguridad', 'Espacio', 'Confiabilidad'],
    message: KEY_MESSAGES.family.message,
  },
  {
    id: 'eco-conscious',
    name: 'Profesionales Eco-conscious',
    description: '28-40 años, sostenibles',
    size: '~280K',
    priority: 'high',
    interests: ['Híbrido', 'Sostenibilidad', 'Tecnología'],
    message: KEY_MESSAGES.hybrid.message,
  },
  {
    id: 'urban-adventurers',
    name: 'Aventureros Urbanos',
    description: '25-45 años, outdoor',
    size: '~320K',
    priority: 'medium',
    interests: ['4x4', 'Aventura', 'Libertad'],
    message: KEY_MESSAGES.adventure.message,
  },
  {
    id: 'sedan-upgraders',
    name: 'Upgrade de Sedán',
    description: '35-50 años, compradores existentes',
    size: '~190K',
    priority: 'medium',
    interests: ['Espacio', 'Versatilidad', 'Status'],
    message: 'Es hora de crecer',
  },
];

// ============================================================================
// TIMING - Mejores momentos para pauta
// ============================================================================
export const OPTIMAL_TIMING = {
  dayparts: [
    { name: 'Mañana', hours: '7:00 - 9:00', performance: 'high', multiplier: 1.2 },
    { name: 'Mediodía', hours: '12:00 - 14:00', performance: 'medium', multiplier: 1.0 },
    { name: 'Tarde', hours: '18:00 - 21:00', performance: 'high', multiplier: 1.3 },
  ],
  weekdays: [
    { name: 'Lunes', performance: 'high', recommended: true },
    { name: 'Martes', performance: 'medium', recommended: false },
    { name: 'Miércoles', performance: 'high', recommended: true },
    { name: 'Jueves', performance: 'high', recommended: true },
    { name: 'Viernes', performance: 'low', recommended: false },
    { name: 'Sábado', performance: 'medium', recommended: false },
    { name: 'Domingo', performance: 'low', recommended: false },
  ],
  events: [
    'Fin de semana largo',
    'Temporada de bonos (Jul-Dic)',
    'Fiestas Patrias',
    'Navidad',
  ],
};

// ============================================================================
// METRIC CARDS - Configuración de tarjetas métricas principales
// ============================================================================
export const METRIC_CARDS_CONFIG = [
  {
    id: 'leads',
    title: 'Leads Calificados',
    description: 'Formularios completos con interés real',
    icon: 'Target',
    color: 'toyota-red',
    gradient: 'from-toyota-red to-toyota-darkRed',
  },
  {
    id: 'reach',
    title: 'Alcance Total',
    description: 'Usuarios únicos impactados',
    icon: 'Users',
    color: 'toyota-gray',
    gradient: 'from-toyota-gray to-toyota-black',
  },
  {
    id: 'engagement',
    title: 'Interacciones',
    description: 'Likes, shares, comentarios, saves',
    icon: 'Heart',
    color: 'toyota-green',
    gradient: 'from-toyota-green to-success',
  },
  {
    id: 'opportunity',
    title: 'Opportunity Score',
    description: 'Índice de oportunidad de inversión',
    icon: 'Zap',
    color: 'toyota-red',
    gradient: 'from-toyota-red to-toyota-green',
  },
];

// ============================================================================
// UI TEXT - Textos de interfaz
// ============================================================================
export const UI_TEXT = {
  loading: 'Cargando Toyota Algorithm...',
  lastUpdate: 'Última actualización',
  systemActive: 'Sistema activo',
  noData: 'No hay datos disponibles',
  error: 'Error al cargar datos',
  retry: 'Reintentar',

  // Footer
  footer: {
    copyright: '© 2025 Toyota Algorithm - Powered by Reset',
    version: 'v1.0.0',
  },

  // Buttons
  buttons: {
    viewDetails: 'Ver detalles',
    export: 'Exportar',
    refresh: 'Actualizar',
    filter: 'Filtrar',
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
  UI_TEXT,
};
