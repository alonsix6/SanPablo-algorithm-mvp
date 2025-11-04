// Mock Data para Toyota RAV4 Híbrida - Dashboard Demo
// Datos simulados realistas para presentación a cliente

// ============================================================================
// MOCK GA4 DATA - Google Analytics 4 simulado
// ============================================================================
export const MOCK_GA4_DATA = {
  // Sesiones web
  sessions: {
    total: 89250,
    new_users: 67890,
    returning: 21360,
    avg_session_duration: '3:24', // minutos:segundos
    pages_per_session: 4.2,
    bounce_rate: 28.5, // porcentaje
  },

  // Páginas más visitadas
  top_pages: [
    {
      page: '/rav4-hibrida',
      title: 'RAV4 Híbrida - Características',
      views: 34500,
      bounce_rate: 32,
      avg_time: '2:45',
    },
    {
      page: '/financiamiento',
      title: 'Opciones de Financiamiento',
      views: 18200,
      bounce_rate: 28,
      avg_time: '3:15',
    },
    {
      page: '/test-drive',
      title: 'Agenda tu Test Drive',
      views: 12800,
      bounce_rate: 15,
      avg_time: '4:20',
    },
    {
      page: '/comparador',
      title: 'Comparador de SUVs',
      views: 9700,
      bounce_rate: 45,
      avg_time: '2:10',
    },
    {
      page: '/galeria',
      title: 'Galería de Fotos',
      views: 7850,
      bounce_rate: 38,
      avg_time: '1:50',
    },
  ],

  // Conversiones (KPIs principales)
  conversions: {
    form_submissions: 1247,
    test_drive_requests: 342,
    brochure_downloads: 2890,
    whatsapp_clicks: 4560,
    phone_calls: 876,
    newsletter_signups: 1920,
  },

  // Fuentes de tráfico
  traffic_sources: {
    organic_search: { percentage: 35, sessions: 31237, label: 'Búsqueda Orgánica' },
    paid_search: { percentage: 28, sessions: 24990, label: 'Google Ads' },
    social_media: { percentage: 22, sessions: 19635, label: 'Redes Sociales' },
    direct: { percentage: 10, sessions: 8925, label: 'Directo' },
    referral: { percentage: 5, sessions: 4462, label: 'Referencias' },
  },

  // Dispositivos
  devices: {
    mobile: { percentage: 68, sessions: 60690, label: 'Mobile' },
    desktop: { percentage: 27, sessions: 24097, label: 'Desktop' },
    tablet: { percentage: 5, sessions: 4462, label: 'Tablet' },
  },

  // Ubicaciones (ciudades Perú)
  locations: [
    { city: 'Lima', sessions: 62475, conversions: 872, percentage: 70 },
    { city: 'Arequipa', sessions: 8925, conversions: 125, percentage: 10 },
    { city: 'Trujillo', sessions: 6247, conversions: 87, percentage: 7 },
    { city: 'Cusco', sessions: 4462, conversions: 62, percentage: 5 },
    { city: 'Chiclayo', sessions: 3570, conversions: 50, percentage: 4 },
    { city: 'Piura', sessions: 2677, conversions: 37, percentage: 3 },
    { city: 'Otros', sessions: 892, conversions: 14, percentage: 1 },
  ],
};

// ============================================================================
// PERFORMANCE KPIs - Métricas principales del dashboard
// ============================================================================
export const PERFORMANCE_KPIS = {
  // Leads calificados
  leads: {
    total: 1247,
    qualified: 856, // 68.6%
    qualification_rate: 68.6,
    cost_per_lead: 12.50, // USD
    trend: '+15%',
    trend_value: 15,
    previous_period: 1084,
    monthly_target: 1500,
    target_completion: 83.1, // porcentaje
  },

  // Alcance
  reach: {
    impressions: 3500000, // 3.5M
    unique_reach: 1200000, // 1.2M
    frequency: 2.9,
    trend: '+22%',
    trend_value: 22,
    previous_period: 2868852,
    cpm: 2.80, // USD
  },

  // Engagement
  engagement: {
    total_interactions: 87500,
    engagement_rate: 2.5, // porcentaje
    shares: 12300,
    saves: 8900,
    comments: 24100,
    likes: 42200,
    trend: '+8%',
    trend_value: 8,
    previous_period: 81018,
  },

  // Conversión (funnel completo)
  conversion_funnel: {
    impressions: 3500000,
    clicks: 105000, // CTR 3%
    ctr: 3.0,
    landing_page_visits: 89250, // 85% del tráfico
    landing_page_rate: 85,
    form_submissions: 1247, // 1.4% conversion
    conversion_rate: 1.4,
    test_drive_bookings: 342, // 27% de leads
    booking_rate: 27.4,
  },

  // Budget & ROI
  budget: {
    total_spent: 15587.50, // USD
    remaining: 4412.50,
    total_budget: 20000,
    spent_percentage: 77.9,
    cost_per_click: 0.15,
    roas: 4.2, // Return on Ad Spend simulado
  },
};

// ============================================================================
// TOYOTA OPPORTUNITY SCORE - Signal Score adaptado
// ============================================================================
export const OPPORTUNITY_SCORE = {
  current_score: 87,
  previous_score: 82,
  trend: '+5',
  grade: 'A', // A, B, C, D, F

  // Componentes del score
  components: {
    trending_topics: {
      score: 92,
      weight: 0.30,
      contribution: 27.6,
      indicators: [
        { name: 'Búsquedas RAV4 (crecimiento)', value: 45, unit: '%', status: 'up' },
        { name: 'Conversación híbridos', value: 38, unit: '%', status: 'up' },
        { name: 'Menciones competencia', value: -12, unit: '%', status: 'down' },
      ],
    },
    intention_to_buy: {
      score: 85,
      weight: 0.35,
      contribution: 29.75,
      indicators: [
        { name: 'Búsquedas precio', value: 52, unit: '%', status: 'up' },
        { name: 'Búsquedas concesionario', value: 28, unit: '%', status: 'up' },
        { name: 'Búsquedas financiamiento', value: 33, unit: '%', status: 'up' },
        { name: 'Solicitudes test drive', value: 342, unit: 'leads', status: 'up' },
      ],
    },
    engagement: {
      score: 78,
      weight: 0.25,
      contribution: 19.5,
      indicators: [
        { name: 'Interacciones sociales', value: 87500, unit: 'total', status: 'up' },
        { name: 'Shares contenido', value: 12300, unit: 'shares', status: 'up' },
        { name: 'Comentarios positivos', value: 89, unit: '%', status: 'stable' },
      ],
    },
    reach: {
      score: 94,
      weight: 0.10,
      contribution: 9.4,
      indicators: [
        { name: 'Impresiones totales', value: 3500000, unit: 'views', status: 'up' },
        { name: 'Alcance orgánico', value: 22, unit: '%', status: 'up' },
      ],
    },
  },

  // Recomendación automática
  recommendation: {
    action: 'INCREASE_INVESTMENT',
    confidence: 'high',
    message: 'Alta oportunidad: Aumentar inversión en Google Search (+25%) y Meta Ads (+15%)',
    priority: 'high',
  },
};

// ============================================================================
// BUDGET ALLOCATION - Distribución de presupuesto recomendada
// ============================================================================
export const BUDGET_ALLOCATION = {
  total_budget: 20000, // USD mensuales
  distribution: {
    google_search: {
      percentage: 35,
      amount: 7000,
      kpi: 'Leads calificados',
      target: '500 leads @ $14 CPL',
      current_performance: 'CPL $12.50 ✓',
      status: 'performing',
    },
    social_media: {
      percentage: 30,
      amount: 6000,
      kpi: 'Alcance + Engagement',
      target: '2M impresiones, 50K interacciones',
      current_performance: '3.5M impresiones ✓',
      status: 'overperforming',
    },
    youtube: {
      percentage: 20,
      amount: 4000,
      kpi: 'View-through rate',
      target: '1M views, 30% VTR',
      current_performance: '28% VTR →',
      status: 'ontrack',
    },
    display: {
      percentage: 10,
      amount: 2000,
      kpi: 'Brand Awareness',
      target: '5M impresiones',
      current_performance: '4.2M impresiones →',
      status: 'ontrack',
    },
    tiktok: {
      percentage: 5,
      amount: 1000,
      kpi: 'Testing nuevos formatos',
      target: '500K views',
      current_performance: '320K views ⚠',
      status: 'underperforming',
    },
  },

  // Recomendaciones de redistribución
  recommendations: [
    {
      type: 'increase',
      channel: 'google_search',
      from: 35,
      to: 40,
      reason: 'CPL por debajo del target, alta conversión',
      impact: '+100 leads estimados',
    },
    {
      type: 'increase',
      channel: 'social_media',
      from: 30,
      to: 32,
      reason: 'Engagement rate superior a benchmark',
      impact: '+15K interacciones estimadas',
    },
    {
      type: 'maintain',
      channel: 'youtube',
      reason: 'Performance según lo esperado',
    },
  ],
};

// ============================================================================
// CONTENT PILLARS - Pilares de contenido RAV4
// ============================================================================
export const CONTENT_PILLARS = [
  {
    id: 'hybrid-tech',
    title: 'Tecnología Híbrida',
    description: 'Eficiencia sin sacrificar potencia',
    formats: ['Videos explicativos', 'Infografías', 'Testimoniales'],
    performance: {
      engagement_rate: 3.2,
      reach: 890000,
      conversions: 287,
    },
    recommended_budget: 0.30,
    status: 'performing',
  },
  {
    id: 'family-safety',
    title: 'Seguridad Familiar',
    description: 'Protegemos lo que más importa',
    formats: ['Demos de seguridad', 'Historias reales', 'Video emocional'],
    performance: {
      engagement_rate: 4.1,
      reach: 1200000,
      conversions: 412,
    },
    recommended_budget: 0.35,
    status: 'overperforming',
  },
  {
    id: 'adventure-4x4',
    title: 'Aventura 4x4',
    description: 'Libertad sin límites',
    formats: ['Videos de ruta', 'Challenges', 'UGC'],
    performance: {
      engagement_rate: 2.8,
      reach: 720000,
      conversions: 178,
    },
    recommended_budget: 0.20,
    status: 'ontrack',
  },
  {
    id: 'sustainability',
    title: 'Sostenibilidad',
    description: 'Movilidad responsable',
    formats: ['Data viz', 'Comparativas ecológicas', 'Educativo'],
    performance: {
      engagement_rate: 2.1,
      reach: 480000,
      conversions: 98,
    },
    recommended_budget: 0.15,
    status: 'underperforming',
  },
];

// ============================================================================
// ALERTS & INSIGHTS - Alertas automáticas
// ============================================================================
export const ALERTS = [
  {
    id: 1,
    type: 'opportunity',
    severity: 'high',
    title: 'Trending: "SUV híbrida precio"',
    message: 'Búsquedas aumentaron +45% en las últimas 48h',
    action: 'Aumentar bid en Google Search',
    channel: 'Google Ads',
    potential_impact: '+50 leads estimados',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
  },
  {
    id: 2,
    type: 'performance',
    severity: 'medium',
    title: 'Instagram Stories con mejor engagement',
    message: 'Stories tienen 3x mejor engagement que posts',
    action: 'Redistribuir 15% de budget a Stories',
    channel: 'Meta Ads',
    potential_impact: '+12K interacciones estimadas',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
  },
  {
    id: 3,
    type: 'warning',
    severity: 'low',
    title: 'TikTok por debajo del target',
    message: 'Views 36% por debajo del objetivo mensual',
    action: 'Revisar creatividades y targeting',
    channel: 'TikTok Ads',
    potential_impact: 'Ajuste de estrategia necesario',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
  },
  {
    id: 4,
    type: 'success',
    severity: 'high',
    title: 'Meta superando objetivos',
    message: 'Alcance +40% sobre target mensual',
    action: 'Mantener estrategia actual',
    channel: 'Meta Ads',
    potential_impact: 'ROI optimizado',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
  },
];

// ============================================================================
// A/B TESTS - Pruebas automáticas
// ============================================================================
export const AB_TESTS = [
  {
    id: 1,
    name: 'Mensaje híbrido vs mensaje aventura',
    status: 'completed',
    winner: 'A',
    variant_a: {
      name: 'Tecnología Híbrida',
      ctr: 3.8,
      conversions: 156,
      cost_per_conversion: 11.20,
    },
    variant_b: {
      name: 'Aventura 4x4',
      ctr: 3.1,
      conversions: 128,
      cost_per_conversion: 13.80,
    },
    recommendation: 'Escalar mensaje híbrido (+22% CTR, -19% CPC)',
    confidence: 95,
  },
  {
    id: 2,
    name: 'Video corto vs video largo',
    status: 'running',
    variant_a: {
      name: 'Video 15seg',
      view_rate: 68,
      engagement_rate: 2.9,
      cost_per_view: 0.04,
    },
    variant_b: {
      name: 'Video 30seg',
      view_rate: 45,
      engagement_rate: 4.2,
      cost_per_view: 0.06,
    },
    current_leader: 'B',
    confidence: 78,
  },
];

// ============================================================================
// COMPETITOR INSIGHTS - Análisis de competencia
// ============================================================================
export const COMPETITOR_INSIGHTS = [
  {
    brand: 'Honda CR-V',
    sentiment: 72,
    share_of_voice: 28,
    trending_topics: ['Espacio interior', 'Tecnología', 'Precio'],
    threat_level: 'high',
  },
  {
    brand: 'Mazda CX-5',
    sentiment: 78,
    share_of_voice: 18,
    trending_topics: ['Diseño', 'Manejo deportivo'],
    threat_level: 'medium',
  },
  {
    brand: 'Hyundai Tucson',
    sentiment: 68,
    share_of_voice: 22,
    trending_topics: ['Garantía', 'Precio competitivo'],
    threat_level: 'high',
  },
  {
    brand: 'Nissan X-Trail',
    sentiment: 65,
    share_of_voice: 15,
    trending_topics: ['7 asientos', 'Espacio'],
    threat_level: 'medium',
  },
  {
    brand: 'Geely Okavango Híbrida',
    sentiment: 70,
    share_of_voice: 12,
    trending_topics: ['Precio accesible', 'Mild Hybrid 48V', '3 filas'],
    threat_level: 'medium',
  },
  {
    brand: 'Haval H6 Híbrida',
    sentiment: 68,
    share_of_voice: 10,
    trending_topics: ['Sistema HEV', 'Seguridad 360°', 'Equipamiento'],
    threat_level: 'medium',
  },
  {
    brand: 'Toyota RAV4',
    sentiment: 85,
    share_of_voice: 17,
    trending_topics: ['Híbrida', 'Confiabilidad', 'Ahorro'],
    threat_level: null, // Es nuestra marca
  },
];

// Exportar todo
export default {
  MOCK_GA4_DATA,
  PERFORMANCE_KPIS,
  OPPORTUNITY_SCORE,
  BUDGET_ALLOCATION,
  CONTENT_PILLARS,
  ALERTS,
  AB_TESTS,
  COMPETITOR_INSIGHTS,
};
