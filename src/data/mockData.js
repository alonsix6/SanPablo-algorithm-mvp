// Mock Data para UCSP - Dashboard Demo
// Datos simulados realistas para presentación

// ============================================================================
// MOCK GA4 DATA - Google Analytics 4 simulado
// ============================================================================
export const MOCK_GA4_DATA = {
  // Sesiones web
  sessions: {
    total: 42200,
    new_users: 25650,
    returning: 2850,
    avg_session_duration: '4:15', // Mayor que autos (más tiempo investigando carreras)
    pages_per_session: 5.8,
    bounce_rate: 32.5, // porcentaje
  },

  // Páginas más visitadas
  top_pages: [
    {
      page: '/admision',
      title: 'Admisión UCSP 2026',
      views: 11200,
      bounce_rate: 32,
      avg_time: '3:45',
    },
    {
      page: '/carreras/ingenieria-industrial',
      title: 'Ingeniería Industrial',
      views: 7500,
      bounce_rate: 28,
      avg_time: '4:12',
    },
    {
      page: '/carreras/medicina',
      title: 'Medicina Humana',
      views: 7200,
      bounce_rate: 25,
      avg_time: '5:05',
    },
    {
      page: '/becas',
      title: 'Becas y Financiamiento',
      views: 9500,
      bounce_rate: 42,
      avg_time: '2:52',
    },
    {
      page: '/carreras/derecho',
      title: 'Derecho',
      views: 5800,
      bounce_rate: 35,
      avg_time: '3:28',
    },
  ],

  // Conversiones (KPIs principales)
  conversions: {
    form_submissions: 980,
    charla_requests: 185,
    brochure_downloads: 420,
    whatsapp_clicks: 1250,
    phone_calls: 220,
    newsletter_signups: 380,
  },

  // Fuentes de tráfico
  traffic_sources: {
    organic_search: { percentage: 32, sessions: 13504, label: 'Búsqueda Orgánica' },
    paid_search: { percentage: 30, sessions: 12660, label: 'Google Ads' },
    social_media: { percentage: 28, sessions: 11816, label: 'Meta Ads' },
    direct: { percentage: 7, sessions: 2954, label: 'Directo' },
    referral: { percentage: 3, sessions: 1266, label: 'Referencias' },
  },

  // Dispositivos
  devices: {
    mobile: { percentage: 72, sessions: 30384, label: 'Mobile' },
    desktop: { percentage: 23, sessions: 9706, label: 'Desktop' },
    tablet: { percentage: 5, sessions: 2110, label: 'Tablet' },
  },

  // Ubicaciones (zonas objetivo)
  locations: [
    { city: 'Arequipa', sessions: 29750, conversions: 2240, percentage: 70 },
    { city: 'Puno', sessions: 7650, conversions: 576, percentage: 18 },
    { city: 'Cusco', sessions: 4250, conversions: 320, percentage: 10 },
    { city: 'Moquegua', sessions: 425, conversions: 32, percentage: 1 },
    { city: 'Tacna', sessions: 425, conversions: 32, percentage: 1 },
  ],
};

// ============================================================================
// PERFORMANCE KPIs - Métricas principales del dashboard
// ============================================================================
export const PERFORMANCE_KPIS = {
  // Postulaciones completadas (reemplazo de leads)
  postulaciones: {
    current: 780,
    previous: 680,
    change: '+14.7',
    trend: 'up',
    label: 'Postulaciones Completadas',
    description: 'Total de postulaciones válidas en periodo',
  },

  // Alias para compatibilidad con OptimizationLayer.jsx
  leads: {
    qualified: 780,
    total: 980,
    qualification_rate: 79.6,
    cost_per_lead: 16.80,
    trend: '+14.7%',
    trend_value: 14.7,
  },

  // Alcance total
  alcance: {
    current: 540000,
    previous: 445000,
    change: '+21.3',
    trend: 'up',
    label: 'Alcance Total',
    description: 'Usuarios únicos impactados',
  },

  // Alias para compatibilidad
  reach: {
    unique_reach: 540000,
    impressions: 1500000,
    frequency: 2.8,
    trend: '+21.3%',
    trend_value: 21.3,
  },

  // Engagement/Interacciones
  engagement: {
    total_interactions: 88000,
    engagement_rate: 16.3,
    shares: 11400,
    trend: '+8.1%',
    trend_value: 8.1,
  },

  // Budget / Presupuesto
  budget: {
    total_budget: 23000, // USD mensual
    total_spent: 21200,
    spent_percentage: 92.0,
    cost_per_click: 0.77,
    trend: 'on-track',
  },

  // CPP (Costo por Postulación) - reemplazo de CPL
  cpp: {
    current: 16.80,
    previous: 18.50,
    change: '-9.2',
    trend: 'down', // Reducción es positivo
    label: 'Costo por Postulación',
    description: '$ invertido por cada postulación válida',
    currency: '$',
  },

  // Charlas informativas asistidas (reemplazo de test drives)
  charlas: {
    current: 185,
    previous: 165,
    change: '+12.1',
    trend: 'up',
    label: 'Charlas Asistidas',
    description: 'Asistentes a charlas informativas',
  },

  // WhatsApp conversaciones
  whatsapp: {
    current: 1250,
    previous: 980,
    change: '+27.6',
    trend: 'up',
    label: 'Conversaciones WhatsApp',
    description: 'Conversaciones iniciadas vía Meta Ads',
  },
};

// ============================================================================
// UCSP OPPORTUNITY SCORE - Reemplazo de Honda Opportunity Score
// ============================================================================
export const OPPORTUNITY_SCORE = {
  current_score: 67,
  trend: '+3.8%',
  components: {
    search_interest: {
      score: 52,
      weight: 0.28,
      contribution: 14.56,
    },
    social_engagement: {
      score: 54,
      weight: 0.22,
      contribution: 11.88,
    },
    conversion_intent: {
      score: 87,
      weight: 0.33,
      contribution: 28.71,
    },
    lead_quality: {
      score: 68,
      weight: 0.17,
      contribution: 11.56,
    },
  },
  recommendation: {
    message: 'Oportunidad moderada para inversión focalizada en canales digitales. Priorizar Google Search y Meta Ads con foco en Medicina (alta conversión) y optimizar presencia en TikTok. Score de 67 indica receptividad media del mercado con margen de mejora.',
    confidence: '82%',
    priority: 'medium',
  },
};

// ============================================================================
// CARRERAS PERFORMANCE - Rendimiento por carrera
// ============================================================================
export const CARRERAS_PERFORMANCE = [
  {
    id: 1,
    nombre: 'Ingeniería Industrial',
    demanda: 'Alta',
    postulaciones: 115,
    cpp: 16.85,
    conversion: 24,
    vacantes: 80,
    tendencia: 'rising',
    hashtags: ['#IngenieriaIndustrial', '#IngenieriaUCSP'],
    leadAds: {
      formularios: 170,
      conversion_rate: 32,
      cpl: 12.15,
    },
    whatsapp: {
      conversaciones: 75,
      respondidas: 58,
      tasa_respuesta: 77,
    },
    landing: {
      visitas: 1150,
      conversion_rate: 18.5,
    },
  },
  {
    id: 2,
    nombre: 'Derecho',
    demanda: 'Alta',
    postulaciones: 97,
    cpp: 19.65,
    conversion: 22,
    vacantes: 60,
    tendencia: 'declining',
    hashtags: ['#DerechoUCSP', '#Derecho'],
    leadAds: {
      formularios: 153,
      conversion_rate: 28,
      cpl: 14.15,
    },
    whatsapp: {
      conversaciones: 63,
      respondidas: 40,
      tasa_respuesta: 63,
    },
    landing: {
      visitas: 975,
      conversion_rate: 16.2,
    },
  },
  {
    id: 3,
    nombre: 'Medicina Humana',
    demanda: 'Muy Alta',
    postulaciones: 129,
    cpp: 22.60,
    conversion: 18,
    vacantes: 40,
    tendencia: 'rising',
    hashtags: ['#MedicinaUCSP', '#Medicina'],
    leadAds: {
      formularios: 195,
      conversion_rate: 35,
      cpl: 16.50,
    },
    whatsapp: {
      conversaciones: 89,
      respondidas: 71,
      tasa_respuesta: 80,
    },
    landing: {
      visitas: 1290,
      conversion_rate: 22.0,
    },
  },
  {
    id: 4,
    nombre: 'Administración',
    demanda: 'Alta',
    postulaciones: 79,
    cpp: 18.35,
    conversion: 20,
    vacantes: 70,
    tendencia: 'stable',
    hashtags: ['#AdministracionUCSP', '#Negocios'],
    leadAds: {
      formularios: 129,
      conversion_rate: 26,
      cpl: 49.00,
    },
    whatsapp: {
      conversaciones: 52,
      respondidas: 34,
      tasa_respuesta: 66,
    },
    landing: {
      visitas: 787,
      conversion_rate: 15.8,
    },
  },
  {
    id: 5,
    nombre: 'Arquitectura y Urbanismo',
    demanda: 'Media-Alta',
    postulaciones: 67,
    cpp: 21.25,
    conversion: 19,
    vacantes: 50,
    tendencia: 'stable',
    hashtags: ['#ArquitecturaUCSP', '#Arquitectura'],
    leadAds: {
      formularios: 113,
      conversion_rate: 25,
      cpl: 54.70,
    },
    whatsapp: {
      conversaciones: 45,
      respondidas: 29,
      tasa_respuesta: 64,
    },
    landing: {
      visitas: 735,
      conversion_rate: 14.5,
    },
  },
  {
    id: 6,
    nombre: 'Psicología',
    demanda: 'Alta',
    postulaciones: 71,
    cpp: 17.60,
    conversion: 21,
    vacantes: 60,
    tendencia: 'stable',
    hashtags: ['#PsicologiaUCSP', '#Psicologia'],
    leadAds: {
      formularios: 119,
      conversion_rate: 27,
      cpl: 46.65,
    },
    whatsapp: {
      conversaciones: 50,
      respondidas: 35,
      tasa_respuesta: 70,
    },
    landing: {
      visitas: 798,
      conversion_rate: 16.0,
    },
  },
  {
    id: 7,
    nombre: 'Ingeniería Civil',
    demanda: 'Media',
    postulaciones: 142,
    cpp: 11.95,
    conversion: 18,
    vacantes: 55,
    tendencia: 'stable',
    hashtags: ['#IngenieriaCivil', '#CivilUCSP'],
    leadAds: {
      formularios: 240,
      conversion_rate: 24,
      cpl: 31.50,
    },
    whatsapp: {
      conversaciones: 95,
      respondidas: 62,
      tasa_respuesta: 65,
    },
    landing: {
      visitas: 1650,
      conversion_rate: 13.8,
    },
  },
  {
    id: 8,
    nombre: 'Contabilidad',
    demanda: 'Media',
    postulaciones: 128,
    cpp: 10.50,
    conversion: 20,
    vacantes: 50,
    tendencia: 'stable',
    hashtags: ['#ContabilidadUCSP', '#Contabilidad'],
    leadAds: {
      formularios: 220,
      conversion_rate: 23,
      cpl: 7.70,
    },
    whatsapp: {
      conversaciones: 85,
      respondidas: 58,
      tasa_respuesta: 68,
    },
    landing: {
      visitas: 1480,
      conversion_rate: 14.2,
    },
  },
  {
    id: 9,
    nombre: 'Ciencia de la Computación',
    demanda: 'Media-Alta',
    postulaciones: 158,
    cpp: 12.45,
    conversion: 22,
    vacantes: 45,
    tendencia: 'rising',
    hashtags: ['#CienciaComputacion', '#TechUCSP'],
    leadAds: {
      formularios: 265,
      conversion_rate: 28,
      cpl: 33.00,
    },
    whatsapp: {
      conversaciones: 105,
      respondidas: 75,
      tasa_respuesta: 71,
    },
    landing: {
      visitas: 1920,
      conversion_rate: 15.5,
    },
  },
  {
    id: 10,
    nombre: 'Ciencia de Datos',
    demanda: 'Alta',
    postulaciones: 185,
    cpp: 13.60,
    conversion: 25,
    vacantes: 40,
    tendencia: 'rising',
    hashtags: ['#CienciaDatos', '#DataScience'],
    leadAds: {
      formularios: 320,
      conversion_rate: 30,
      cpl: 9.85,
    },
    whatsapp: {
      conversaciones: 135,
      respondidas: 102,
      tasa_respuesta: 76,
    },
    landing: {
      visitas: 2150,
      conversion_rate: 17.8,
    },
  },
  {
    id: 11,
    nombre: 'Ingeniería Electrónica y Telecomunicaciones',
    demanda: 'Media',
    postulaciones: 118,
    cpp: 11.55,
    conversion: 19,
    vacantes: 45,
    tendencia: 'stable',
    hashtags: ['#ElectronicaUCSP', '#Telecomunicaciones'],
    leadAds: {
      formularios: 198,
      conversion_rate: 22,
      cpl: 30.00,
    },
    whatsapp: {
      conversaciones: 78,
      respondidas: 50,
      tasa_respuesta: 64,
    },
    landing: {
      visitas: 1420,
      conversion_rate: 13.2,
    },
  },
  {
    id: 12,
    nombre: 'Ingeniería Mecatrónica',
    demanda: 'Media',
    postulaciones: 125,
    cpp: 12.30,
    conversion: 20,
    vacantes: 40,
    tendencia: 'stable',
    hashtags: ['#MecatronicaUCSP', '#Mecatronica'],
    leadAds: {
      formularios: 210,
      conversion_rate: 23,
      cpl: 32.00,
    },
    whatsapp: {
      conversaciones: 82,
      respondidas: 55,
      tasa_respuesta: 67,
    },
    landing: {
      visitas: 1520,
      conversion_rate: 14.0,
    },
  },
  {
    id: 13,
    nombre: 'Ingeniería Ambiental',
    demanda: 'Media',
    postulaciones: 105,
    cpp: 11.15,
    conversion: 18,
    vacantes: 35,
    tendencia: 'rising',
    hashtags: ['#IngenieriaAmbiental', '#Sostenibilidad'],
    leadAds: {
      formularios: 175,
      conversion_rate: 21,
      cpl: 7.95,
    },
    whatsapp: {
      conversaciones: 68,
      respondidas: 45,
      tasa_respuesta: 66,
    },
    landing: {
      visitas: 1280,
      conversion_rate: 12.8,
    },
  },
];

// ============================================================================
// COMPETENCIA - Universidades competidoras
// ============================================================================
export const COMPETENCIA = [
  {
    name: 'UNSA',
    full_name: 'Universidad Nacional de San Agustín',
    market_share: 45,
    postulantes: 49509,
    rank: 1,
    type: 'Pública',
    fortalezas: ['Tradición', 'Bajo costo', 'Mayor demanda del país'],
    debilidades: ['Masificación', 'Infraestructura limitada'],
  },
  {
    name: 'UCSM',
    full_name: 'Universidad Católica Santa María',
    market_share: 28,
    postulantes: 8500,
    rank: 2,
    type: 'Privada',
    fortalezas: ['Infraestructura', 'Carreras similares'],
    debilidades: ['Menor acreditación internacional'],
  },
  {
    name: 'UCSP',
    full_name: 'Universidad Católica San Pablo',
    market_share: 15,
    postulantes: 3200,
    rank: 3,
    type: 'Privada',
    fortalezas: ['Primera licenciada del sur', 'Acreditación internacional', 'Formación integral'],
    debilidades: ['Menor awareness', 'Percepción de costo'],
  },
  {
    name: 'UTP',
    full_name: 'Universidad Tecnológica del Perú',
    market_share: 8,
    postulantes: 2800,
    rank: 4,
    type: 'Privada',
    fortalezas: ['Presencia nacional', 'Marketing agresivo'],
    debilidades: ['Menor calidad percibida'],
  },
  {
    name: 'UAP',
    full_name: 'Universidad Alas Peruanas',
    market_share: 4,
    postulantes: 1500,
    rank: 5,
    type: 'Privada',
    fortalezas: ['Presencia nacional'],
    debilidades: ['Problemas de licenciamiento'],
  },
];

// ============================================================================
// HUBSPOT MOCKUP - Datos simulados de HubSpot
// ============================================================================
export const HUBSPOT_MOCKUP = {
  campaigns: [
    {
      id: 'camp_001',
      name: 'Admisión 2026-I Pregrado',
      status: 'active',
      budget: 25000,
      spent: 18750,
      leads: 856,
      cpl: 21.90,
      alert_status: 'normal', // normal, warning, danger
      platform: 'Meta Ads',
      audience: 'Pregrado',
    },
    {
      id: 'camp_002',
      name: 'Ingeniería Industrial - Lead Ads',
      status: 'active',
      budget: 8500,
      spent: 6820,
      leads: 285,
      cpl: 23.93,
      alert_status: 'normal',
      platform: 'Meta Ads',
      audience: 'Pregrado',
    },
    {
      id: 'camp_003',
      name: 'Medicina - Google Search',
      status: 'active',
      budget: 12000,
      spent: 10500,
      leads: 198,
      cpl: 53.03,
      alert_status: 'warning', // CPL cercano al límite
      platform: 'Google Ads',
      audience: 'Pregrado',
    },
    {
      id: 'camp_004',
      name: 'Posgrado - Maestrías',
      status: 'active',
      budget: 6500,
      spent: 4875,
      leads: 68,
      cpl: 71.69,
      alert_status: 'warning',
      platform: 'Google Ads',
      audience: 'Posgrado',
    },
  ],
  alerts: [
    {
      type: 'warning',
      message: 'Campaña "Medicina - Google Search" con CPL de $11.80, cerca del límite de $12',
      campaign_id: 'camp_003',
      timestamp: '2025-11-20T14:30:00',
    },
    {
      type: 'warning',
      message: 'Campaña "Posgrado - Maestrías" con CPL de $14.20, cerca del límite de $15',
      campaign_id: 'camp_004',
      timestamp: '2025-11-20T13:15:00',
    },
  ],
  lead_quality: {
    avg_score: 72,
    distribution: {
      hot: 28, // %
      warm: 45,
      cold: 27,
    },
  },
};

// ============================================================================
// BUDGET ALLOCATION - Distribución de presupuesto por canal
// ============================================================================
export const BUDGET_ALLOCATION = {
  total_budget: 23000, // USD mensual para Admisiones 2026-I
  distribution: {
    google_search: {
      amount: 8050, // 35%
      percentage: 35,
      status: 'overperforming',
      kpi: 'CPL (Costo por Lead)',
      target: '$9.50 o menos',
      current_performance: '$8.80',
    },
    social_media: {
      amount: 8050, // 35%
      percentage: 35,
      status: 'performing',
      kpi: 'CPP (Costo por Postulación)',
      target: '$10.80 o menos',
      current_performance: '$10.30',
      whatsapp_metrics: {
        conversations: 1847,
        response_rate: 68,
      },
    },
    youtube: {
      amount: 4600, // 20%
      percentage: 20,
      status: 'ontrack',
      kpi: 'CPV (Costo por Vista)',
      target: '$0.04 o menos',
      current_performance: '$0.038',
    },
    display: {
      amount: 2300, // 10%
      percentage: 10,
      status: 'performing',
      kpi: 'CPM (Costo por Mil)',
      target: '$3.20 o menos',
      current_performance: '$3.18',
    },
  },
  recommendations: [
    {
      type: 'increase',
      channel: 'google_search',
      from: 35,
      to: 40,
      reason: 'CPL 7% por debajo del objetivo, excelente performance en búsquedas de carreras',
      impact: '+120 postulaciones/mes estimadas',
    },
    {
      type: 'maintain',
      channel: 'social_media',
      reason: 'Meta Ads con buen engagement en Pregrado, WhatsApp con 68% de respuesta',
      impact: 'Mantener volumen actual',
    },
    {
      type: 'decrease',
      channel: 'display',
      from: 10,
      to: 5,
      reason: 'Bajo engagement en Display, redirigir a Search',
      impact: 'Redistribución más eficiente',
    },
  ],
};

// ============================================================================
// CONTENT PILLARS - Pilares de contenido UCSP
// ============================================================================
export const CONTENT_PILLARS = [
  {
    id: 1,
    title: 'Licenciamiento y Calidad Académica',
    description: 'Universidad licenciada por SUNEDU con altos estándares de calidad',
    status: 'overperforming',
    performance: {
      engagement_rate: 14.2,
      reach: 182000,
      conversions: 385,
    },
    recommended_budget: 0.30, // 30%
    formats: ['Video institucional', 'Infografías', 'Testimoniales'],
  },
  {
    id: 2,
    title: 'Formación Profesional Integral',
    description: 'Educación de excelencia con valores católicos y visión humanista',
    status: 'performing',
    performance: {
      engagement_rate: 11.8,
      reach: 156000,
      conversions: 298,
    },
    recommended_budget: 0.25, // 25%
    formats: ['Historias de éxito', 'Videos emocionales', 'Lives'],
  },
  {
    id: 3,
    title: 'Acreditación Internacional',
    description: 'Carreras acreditadas internacionalmente, reconocimiento global',
    status: 'performing',
    performance: {
      engagement_rate: 10.5,
      reach: 134000,
      conversions: 245,
    },
    recommended_budget: 0.20, // 20%
    formats: ['Reconocimientos', 'Casos de éxito', 'Infografías'],
  },
  {
    id: 4,
    title: 'Innovación y Tecnología',
    description: 'Laboratorios de última generación, investigación aplicada',
    status: 'ontrack',
    performance: {
      engagement_rate: 9.2,
      reach: 118000,
      conversions: 185,
    },
    recommended_budget: 0.15, // 15%
    formats: ['Tour virtual', 'Videos tech', 'Demos'],
  },
  {
    id: 5,
    title: 'Empleabilidad y Convenios',
    description: 'Alta tasa de empleabilidad, convenios con empresas líderes',
    status: 'performing',
    performance: {
      engagement_rate: 8.8,
      reach: 105000,
      conversions: 156,
    },
    recommended_budget: 0.10, // 10%
    formats: ['Data viz', 'Testimoniales empresas', 'Estadísticas'],
  },
];

// ============================================================================
// ALERTS - Alertas automáticas del sistema
// ============================================================================
export const ALERTS = [
  {
    id: 1,
    severity: 'high',
    title: 'CPL elevado en Medicina',
    message: 'Campaña de Medicina en Google Search superó $11.80, cerca del límite de $12',
    action: 'Revisar keywords y ajustar bids, considerar pausar temporalmente',
    timestamp: '2025-11-20T14:30:00',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'Engagement bajo en YouTube',
    message: 'Videos de carreras tech tienen 35% menos engagement que promedio',
    action: 'Mejorar thumbnails y primeros 5 segundos, probar formato shorts',
    timestamp: '2025-11-20T13:15:00',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Oportunidad en Puno',
    message: 'Tráfico desde Puno creció +28% esta semana, bajo CPL de $7.55',
    action: 'Considerar aumentar budget 15% para Puno en próxima semana',
    timestamp: '2025-11-20T11:45:00',
  },
];

// ============================================================================
// COMPETITOR INSIGHTS - Análisis de competencia universitaria
// ============================================================================
export const COMPETITOR_INSIGHTS = [
  {
    brand: 'UNSA',
    full_name: 'Universidad Nacional de San Agustín',
    location: 'Arequipa',
    share_of_voice: 38,
    sentiment: 72,
    threat_level: 'high',
    trending_topics: ['Universidad pública', 'Tradición', 'Ingeniería'],
    description: 'Principal universidad pública del sur, 2da en ranking nacional Sunedu 2026',
  },
  {
    brand: 'UCSM',
    full_name: 'Universidad Católica Santa María',
    location: 'Arequipa',
    share_of_voice: 22,
    sentiment: 68,
    threat_level: 'high',
    trending_topics: ['Infraestructura', 'Medicina', 'Campus moderno'],
    description: 'Principal competidor privado en Arequipa, fuerte en medicina',
  },
  {
    brand: 'UNSAAC',
    full_name: 'Universidad Nacional de San Antonio Abad del Cusco',
    location: 'Cusco',
    share_of_voice: 12,
    sentiment: 70,
    threat_level: 'high',
    trending_topics: ['Universidad pública Cusco', '6000+ postulantes', '41 carreras'],
    description: 'Segunda universidad nacional más grande del sur, posición 9 en ranking público Sunedu',
  },
  {
    brand: 'UTP',
    full_name: 'Universidad Tecnológica del Perú',
    location: 'Arequipa',
    share_of_voice: 10,
    sentiment: 70,
    threat_level: 'medium',
    trending_topics: ['Empleabilidad', 'Carreras tech', 'Innovación'],
    description: 'Enfoque en tecnología y empleabilidad, creciente presencia regional',
  },
  {
    brand: 'UAC',
    full_name: 'Universidad Andina del Cusco',
    location: 'Cusco',
    share_of_voice: 8,
    sentiment: 66,
    threat_level: 'medium',
    trending_topics: ['Presencia regional', 'Múltiples sedes', 'Flexibilidad'],
    description: 'Privada con 4 campus (Cusco, Sicuani, Quillabamba, Pto. Maldonado), fuerte cobertura Cusco',
  },
  {
    brand: 'ULASALLE',
    full_name: 'Universidad La Salle',
    location: 'Arequipa',
    share_of_voice: 3,
    sentiment: 74,
    threat_level: 'low',
    trending_topics: ['Educación lasallista', 'Valores', 'Calidad nicho'],
    description: 'Pequeña pero de calidad, enfoque en valores lasallistas, licenciada desde 2018',
  },
  {
    brand: 'UCSP',
    full_name: 'Universidad Católica San Pablo',
    location: 'Arequipa',
    share_of_voice: 13,
    sentiment: 78,
    threat_level: null,
    trending_topics: ['Primera licenciada sur', 'Acreditación internacional', 'Valores católicos'],
    description: 'Primera universidad licenciada del sur, posición 19 en ranking QS 2024',
  },
];

// ============================================================================
// EXPORTS
// ============================================================================
export default {
  MOCK_GA4_DATA,
  PERFORMANCE_KPIS,
  OPPORTUNITY_SCORE,
  CARRERAS_PERFORMANCE,
  COMPETENCIA,
  HUBSPOT_MOCKUP,
  BUDGET_ALLOCATION,
  CONTENT_PILLARS,
  ALERTS,
  COMPETITOR_INSIGHTS,
};
