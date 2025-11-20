// Keywords y hashtags para UCSP - Universidad Católica San Pablo (Arequipa, Perú)
// Configuración completa para búsquedas y monitoreo social

export const KEYWORDS_UCSP = {
  // Marca UCSP
  marca: [
    'UCSP',
    'Universidad Católica San Pablo',
    'San Pablo Arequipa',
    'UCSP admisión',
    'admisión UCSP 2026',
    'examen UCSP',
    'UCSP Perú',
    'Universidad San Pablo',
    'Católica San Pablo',
    'UCSP 2026',
  ],

  // Carreras principales (top 5 más demandadas)
  carreras: [
    'ingeniería industrial UCSP',
    'derecho UCSP',
    'medicina UCSP',
    'administración UCSP',
    'arquitectura UCSP',
    'ingeniería civil Arequipa',
    'psicología UCSP',
    'contabilidad Arequipa',
    'ciencia de datos UCSP',
    'mecatrónica Arequipa',
  ],

  // Intención de búsqueda (postulación)
  intencion: [
    'donde estudiar en Arequipa',
    'mejores universidades Arequipa',
    'universidad católica Arequipa',
    'costo universidad UCSP',
    'pensiones UCSP',
    'becas UCSP',
    'admisión 2026 Arequipa',
    'examen de admisión UCSP',
    'requisitos UCSP',
    'cronograma admisión UCSP',
  ],

  // Competencia directa
  competidores: [
    'UNSA admisión',
    'UCSM Arequipa',
    'UCSP vs UCSM',
    'UCSP vs UNSA',
    'universidades Arequipa ranking',
    'UTP Arequipa',
    'UAP Arequipa',
    'universidad Arequipa',
    'mejores universidades sur Perú',
  ],

  // Información académica
  academico: [
    'universidad licenciada Arequipa',
    'acreditación SUNEDU',
    'licenciamiento UCSP',
    'universidad católica licenciada',
    'acreditación internacional UCSP',
    'ranking universidades Arequipa',
    'calidad educativa UCSP',
  ],

  // Proceso de admisión
  admision: [
    'postular UCSP',
    'examen UCSP 2026',
    'inscripción UCSP',
    'vacantes UCSP',
    'modalidades admisión UCSP',
    'preparación examen UCSP',
    'sílabo UCSP',
    'resultados admisión UCSP',
  ],

  // Geografías clave
  geografias: [
    'universidad Arequipa',
    'universidad Puno',
    'universidad Cusco',
    'universidad Moquegua',
    'universidad Tacna',
    'universidad Juliaca',
    'estudiar en Arequipa',
  ],

  // Posgrado
  posgrado: [
    'maestría UCSP',
    'posgrado Arequipa',
    'diplomados UCSP',
    'MBA Arequipa',
    'maestría derecho UCSP',
    'maestría ingeniería',
    'educación continua UCSP',
  ],
};

export const HASHTAGS_UCSP = {
  // Principales UCSP
  principales: [
    '#UCSP',
    '#UniversidadCatolicaSanPablo',
    '#SanPabloArequipa',
    '#AdmisionUCSP',
    '#UCSP2026',
    '#SomosUCSP',
  ],

  // Carreras
  carreras: [
    '#IngenieriaUCSP',
    '#DerechoUCSP',
    '#MedicinaUCSP',
    '#AdministracionUCSP',
    '#ArquitecturaUCSP',
    '#PsicologiaUCSP',
    '#CienciaDeDatosUCSP',
    '#IngenieriaCivil',
    '#Mecatronica',
  ],

  // Admisión y postulantes
  admision: [
    '#Postulantes2026',
    '#Admision2026',
    '#ExamenDeAdmision',
    '#Preuniversitario',
    '#PostulaUCSP',
    '#VacantesUCSP',
    '#AdmisionUCSP2026',
  ],

  // Vida universitaria
  vidaUniversitaria: [
    '#VidaUniversitaria',
    '#EstudiaUniversitario',
    '#CampusUCSP',
    '#UniversitariosArequipa',
    '#ViveUCSP',
    '#ExperienciaUCSP',
  ],

  // Geografía
  geografia: [
    '#Arequipa',
    '#UniversidadesArequipa',
    '#EstudiaEnArequipa',
    '#ArequipaPeru',
    '#SurPeru',
    '#Puno',
    '#Cusco',
    '#Moquegua',
    '#Tacna',
  ],

  // Generales educación
  educacion: [
    '#UniversidadesPeru',
    '#EstudiaPeru',
    '#EducacionSuperior',
    '#UniversidadLicenciada',
    '#CalidadAcademica',
    '#FormacionIntegral',
  ],

  // Competencia (para monitoreo)
  competencia: [
    '#UNSA',
    '#UCSM',
    '#UTP',
    '#UniversidadesCatolicas',
  ],
};

// Combinar todos los hashtags
export const ALL_HASHTAGS = [
  ...HASHTAGS_UCSP.principales,
  ...HASHTAGS_UCSP.carreras,
  ...HASHTAGS_UCSP.admision,
  ...HASHTAGS_UCSP.vidaUniversitaria,
  ...HASHTAGS_UCSP.geografia,
  ...HASHTAGS_UCSP.educacion,
];

// Combinar keywords para Google Trends
export const ALL_KEYWORDS = [
  ...KEYWORDS_UCSP.marca,
  ...KEYWORDS_UCSP.carreras,
  ...KEYWORDS_UCSP.intencion,
  ...KEYWORDS_UCSP.admision,
];

// Keywords de alta intención (conversión)
export const HIGH_INTENT_KEYWORDS = [
  ...KEYWORDS_UCSP.admision,
  ...KEYWORDS_UCSP.intencion.filter(k => k.includes('costo') || k.includes('becas') || k.includes('admisión')),
  'postular UCSP',
  'examen UCSP 2025',
  'inscripción UCSP',
  'vacantes UCSP',
  'pensiones UCSP',
];

// Configuración para Google Trends
export const GOOGLE_TRENDS_CONFIG = {
  keywords: ALL_KEYWORDS.slice(0, 15), // Máximo 15 keywords principales
  region: 'PE', // Perú
  // Geografías específicas a monitorear
  geo: {
    arequipa: 'PE-ARE',
    puno: 'PE-PUN',
    cusco: 'PE-CUS',
    moquegua: 'PE-MOQ',
    tacna: 'PE-TAC',
  },
  category: 67, // Education (en lugar de Autos)
  timeframe: 'now 7-d', // Últimos 7 días
  refreshInterval: 3600000, // 1 hora en ms
};

// Configuración para TikTok
export const TIKTOK_CONFIG = {
  hashtags: HASHTAGS_UCSP.principales,
  region: 'PE',
  metrics: ['views', 'likes', 'shares', 'comments'],
  trending_threshold: 5000, // Menor que autos (nicho educación)
};

// Configuración para Meta (Facebook/Instagram)
export const META_CONFIG = {
  hashtags: [
    ...HASHTAGS_UCSP.principales,
    ...HASHTAGS_UCSP.carreras,
    ...HASHTAGS_UCSP.admision,
  ],
  pages: [
    'Universidad Católica San Pablo',
    'UCSP Oficial',
    'Admisión UCSP',
  ],
  groups: [
    'Postulantes UCSP 2025',
    'Estudiantes UCSP',
    'Ingresantes UCSP',
  ],
};

// Fuentes de información educativa Perú
export const EDUCATION_SOURCES = [
  {
    name: 'UCSP Oficial',
    url: 'https://ucsp.edu.pe',
    type: 'official',
    scraping: false,
  },
  {
    name: 'Admisión UCSP',
    url: 'https://admision.ucsp.edu.pe',
    type: 'official',
    scraping: false,
  },
  {
    name: 'SUNEDU',
    url: 'https://www.sunedu.gob.pe',
    type: 'regulatory',
    scraping: false,
  },
  {
    name: 'Ponte en Carrera',
    url: 'https://www.ponteencarrera.pe',
    type: 'platform',
    scraping: true,
  },
  {
    name: 'Estudia Perú',
    url: 'https://estudiaperu.pe',
    type: 'platform',
    scraping: true,
  },
];

// Carreras UCSP (para monitoreo individual)
export const CARRERAS_UCSP = [
  {
    id: 1,
    nombre: 'Ingeniería Industrial',
    slug: 'ingenieria-industrial',
    demanda: 'Alta',
    keywords: ['ingeniería industrial UCSP', 'ingeniería industrial Arequipa'],
    hashtags: ['#IngenieriaIndustrial', '#IngenieriaUCSP'],
  },
  {
    id: 2,
    nombre: 'Derecho',
    slug: 'derecho',
    demanda: 'Alta',
    keywords: ['derecho UCSP', 'abogado Arequipa', 'derecho católica'],
    hashtags: ['#DerechoUCSP', '#Derecho', '#Abogado'],
  },
  {
    id: 3,
    nombre: 'Medicina Humana',
    slug: 'medicina',
    demanda: 'Muy Alta',
    keywords: ['medicina UCSP', 'medicina Arequipa', 'carrera medicina'],
    hashtags: ['#MedicinaUCSP', '#Medicina', '#FuturosDoctor'],
  },
  {
    id: 4,
    nombre: 'Administración',
    slug: 'administracion',
    demanda: 'Alta',
    keywords: ['administración negocios UCSP', 'administración Arequipa'],
    hashtags: ['#AdministracionUCSP', '#Negocios'],
  },
  {
    id: 5,
    nombre: 'Arquitectura y Urbanismo',
    slug: 'arquitectura',
    demanda: 'Media-Alta',
    keywords: ['arquitectura UCSP', 'arquitectura Arequipa'],
    hashtags: ['#ArquitecturaUCSP', '#Arquitectura'],
  },
  {
    id: 6,
    nombre: 'Psicología',
    slug: 'psicologia',
    demanda: 'Alta',
    keywords: ['psicología UCSP', 'psicología Arequipa'],
    hashtags: ['#PsicologiaUCSP', '#Psicologia'],
  },
  {
    id: 7,
    nombre: 'Ingeniería Civil',
    slug: 'ingenieria-civil',
    demanda: 'Media',
    keywords: ['ingeniería civil UCSP', 'civil Arequipa'],
    hashtags: ['#IngenieriaCivil', '#CivilUCSP'],
  },
  {
    id: 8,
    nombre: 'Contabilidad',
    slug: 'contabilidad',
    demanda: 'Media',
    keywords: ['contabilidad UCSP', 'contador Arequipa'],
    hashtags: ['#ContabilidadUCSP', '#Contabilidad'],
  },
  {
    id: 9,
    nombre: 'Ciencia de la Computación',
    slug: 'ciencia-computacion',
    demanda: 'Media-Alta',
    keywords: ['ciencia computación UCSP', 'computación Arequipa'],
    hashtags: ['#CienciaComputacion', '#TechUCSP'],
  },
  {
    id: 10,
    nombre: 'Ciencia de Datos',
    slug: 'ciencia-datos',
    demanda: 'Alta',
    keywords: ['ciencia datos UCSP', 'data science Arequipa'],
    hashtags: ['#CienciaDatos', '#DataScience'],
  },
  {
    id: 11,
    nombre: 'Ingeniería Electrónica y Telecomunicaciones',
    slug: 'electronica-telecomunicaciones',
    demanda: 'Media',
    keywords: ['electrónica UCSP', 'telecomunicaciones Arequipa'],
    hashtags: ['#ElectronicaUCSP', '#Telecomunicaciones'],
  },
  {
    id: 12,
    nombre: 'Ingeniería Mecatrónica',
    slug: 'mecatronica',
    demanda: 'Media',
    keywords: ['mecatrónica UCSP', 'mecatrónica Arequipa'],
    hashtags: ['#MecatronicaUCSP', '#Mecatronica'],
  },
  {
    id: 13,
    nombre: 'Ingeniería Ambiental',
    slug: 'ingenieria-ambiental',
    demanda: 'Media',
    keywords: ['ingeniería ambiental UCSP', 'ambiental Arequipa'],
    hashtags: ['#IngenieriaAmbiental', '#Sostenibilidad'],
  },
];

export default {
  KEYWORDS_UCSP,
  HASHTAGS_UCSP,
  ALL_HASHTAGS,
  ALL_KEYWORDS,
  HIGH_INTENT_KEYWORDS,
  GOOGLE_TRENDS_CONFIG,
  TIKTOK_CONFIG,
  META_CONFIG,
  EDUCATION_SOURCES,
  CARRERAS_UCSP,
};
