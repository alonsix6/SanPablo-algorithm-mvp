import { useState, useEffect } from 'react';
import { Search, TrendingUp, Video, Share2, Car, RefreshCw, ChevronDown, ChevronUp, BarChart3, Info } from 'lucide-react';

export default function DataLayer() {
  const [trendsData, setTrendsData] = useState(null);
  const [tiktokData, setTiktokData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [ga4Data, setGA4Data] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Estados de secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    trends: false,
    tiktok: false,
    meta: false,
    ga4: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [trends, tiktok, meta, ga4] = await Promise.all([
        fetch('/data/trends/latest.json').then(r => r.json()).catch(() => null),
        fetch('/data/tiktok/latest.json').then(r => r.json()).catch(() => null),
        fetch('/data/meta/latest.json').then(r => r.json()).catch(() => null),
        fetch('/data/mock/ga4_data.json').then(r => r.json()).catch(() => null)
      ]);

      setTrendsData(trends);
      setTiktokData(tiktok);
      setMetaData(meta);
      setGA4Data(ga4);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calcular scores de cada fuente
  const calculateScores = () => {
    let searchScore = 7.5;
    let trendScore = 8.2;
    let socialScore = 8.5;
    let intentScore = 6.8;

    // Google Trends: promedio de average_interest (0-100 → 0-10)
    if (trendsData?.keywords?.length > 0) {
      const avgInterest = trendsData.keywords.reduce((sum, kw) => sum + (kw.average_interest || 0), 0) / trendsData.keywords.length;
      searchScore = (avgInterest / 10).toFixed(1);
    }

    // TikTok: promedio de relevanceScore (0-100 → 0-10)
    if (tiktokData?.trends?.hashtags?.length > 0) {
      const avgRelevance = tiktokData.trends.hashtags.reduce((sum, tag) => sum + (tag.relevanceScore || 0), 0) / tiktokData.trends.hashtags.length;
      trendScore = (avgRelevance / 10).toFixed(1);
    }

    // Meta: promedio de engagement_score (ya está en 0-10)
    if (metaData?.aggregatedTopics?.length > 0) {
      const avgEngagement = metaData.aggregatedTopics.reduce((sum, topic) => sum + (topic.engagement_score || 0), 0) / metaData.aggregatedTopics.length;
      socialScore = avgEngagement.toFixed(1);
    }

    // GA4: conversión como indicador de intención (0-1 → 0-10)
    if (ga4Data?.overview?.conversionRate) {
      intentScore = (ga4Data.overview.conversionRate * 150).toFixed(1); // 0.063 → 9.5
    }

    const overallScore = ((parseFloat(searchScore) + parseFloat(trendScore) + parseFloat(socialScore) + parseFloat(intentScore)) / 4).toFixed(1);

    return {
      overall: overallScore,
      search: searchScore,
      trend: trendScore,
      social: socialScore,
      intent: intentScore
    };
  };

  const scores = calculateScores();

  return (
    <div className="space-y-6">
      {/* Header & Score Summary */}
      <div className="bg-gradient-to-br from-toyota-red to-toyota-darkRed rounded-2xl shadow-toyota-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Capa de Data - Captura de Señales
            </h2>
            <p className="text-white/80 text-lg">
              Monitoreo en tiempo real del ecosistema digital automotriz en Perú
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition disabled:opacity-50 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-xs uppercase font-semibold mb-1">Score Global</p>
            <p className="text-4xl font-bold mb-1">{scores.overall}</p>
            <p className="text-xs text-white/60">Promedio de 4 fuentes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-xs uppercase font-semibold mb-1">Búsqueda</p>
            <p className="text-3xl font-bold mb-1">{scores.search}</p>
            <p className="text-xs text-white/60">Google Trends</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-xs uppercase font-semibold mb-1">Tendencia</p>
            <p className="text-3xl font-bold mb-1">{scores.trend}</p>
            <p className="text-xs text-white/60">TikTok Viral</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-xs uppercase font-semibold mb-1">Social</p>
            <p className="text-3xl font-bold mb-1">{scores.social}</p>
            <p className="text-xs text-white/60">Meta Engagement</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-xs uppercase font-semibold mb-1">Intención</p>
            <p className="text-3xl font-bold mb-1">{scores.intent}</p>
            <p className="text-xs text-white/60">GA4 Conversión</p>
          </div>
        </div>

        {/* Data Sources Status */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-white/80">Google Trends Activo</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-white/80">TikTok Activo</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-white/80">Meta Activo</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-white/80">GA4 (Mock Data)</span>
          </div>
          {lastRefresh && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 ml-auto">
              <span className="text-xs text-white/60">
                Actualizado: {lastRefresh.toLocaleTimeString('es-PE')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Google Trends Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('trends')}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between hover:from-blue-600 hover:to-blue-700 transition"
        >
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-bold">Google Trends</h3>
              <p className="text-sm text-blue-100">Keywords automotrices en tendencia • Score: {scores.search}/10</p>
            </div>
          </div>
          {expandedSections.trends ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.trends && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Promedio del "interés de búsqueda" (0-100) de todas las keywords automotrices monitoreadas en Perú. Score alto indica fuerte demanda de información sobre RAV4 y SUVs híbridas.</p>
                <p className="mt-2 text-xs text-blue-700">
                  <strong>Fuente:</strong> Google Trends API (Perú) • <strong>Actualización:</strong> Semanal • <strong>Categoría:</strong> Automotive
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Keyword</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Interés Promedio</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Pico</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crecimiento 3m</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trendsData?.keywords?.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{kw.keyword}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-blue-600">{kw.average_interest}/100</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-gray-700">{kw.peak_score}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-green-600">{kw.growth_3m}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          kw.trend === 'rising' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {kw.trend === 'rising' ? '↑ Subiendo' : '→ Estable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Regional Distribution Charts - Top 5 Keywords Only */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Distribución Regional por Keyword (Top 5)</h4>
              <div className="space-y-6">
                {trendsData?.keywords?.slice(0, 5).map((kw, idx) => (
                  kw.top_regions && Object.keys(kw.top_regions).length > 0 && (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">{kw.keyword}</h5>
                      <div className="space-y-2">
                        {Object.entries(kw.top_regions)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([region, score], regionIdx) => (
                            <div key={regionIdx} className="flex items-center gap-3">
                              <div className="w-24 text-xs font-medium text-gray-700 truncate">{region}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                  style={{ width: `${score}%` }}
                                >
                                  <span className="text-xs font-semibold text-white">{score}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TikTok Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('tiktok')}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between hover:from-pink-600 hover:to-purple-700 transition"
        >
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-bold">TikTok Creative Center</h3>
              <p className="text-sm text-pink-100">Hashtags automotrices virales • Score: {scores.trend}/10</p>
            </div>
          </div>
          {expandedSections.tiktok ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.tiktok && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Promedio del "relevance score" (0-100) de los hashtags automotrices más virales. Score alto indica alto potencial de viralidad para contenido de RAV4 y SUVs.</p>
                <p className="mt-2 text-xs text-purple-700">
                  <strong>Fuente:</strong> TikTok Creative Center (datos públicos) • <strong>Actualización:</strong> Semanal • <strong>Región:</strong> Peru + Global
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hashtag</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Views</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Posts</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crecimiento</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Relevancia</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Región</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tiktokData?.trends?.hashtags?.slice(0, 10).map((tag, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tag.hashtag}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-purple-600">{tag.views}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">{tag.posts}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-green-600">{tag.growth}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-gray-700">{tag.relevanceScore}/100</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tag.region === 'Peru' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tag.region}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Meta Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('meta')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-bold">Meta/Facebook Trends</h3>
              <p className="text-sm text-blue-100">Tendencias automotrices en redes sociales • Score: {scores.social}/10</p>
            </div>
          </div>
          {expandedSections.meta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.meta && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Promedio del "engagement score" (0-10) de los temas automotrices más discutidos en Facebook e Instagram. Score alto indica fuerte conversación social sobre RAV4.</p>
                <p className="mt-2 text-xs text-indigo-700">
                  <strong>Fuente:</strong> Páginas públicas verificadas (Toyota Perú 450K likes, Derco Perú 285K, etc.) • <strong>Actualización:</strong> Semanal • <strong>Método:</strong> Análisis manual de engagement público
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tema</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Menciones</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Engagement</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Crecimiento</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Sentimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Marcas Top</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metaData?.aggregatedTopics?.slice(0, 8).map((topic, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{topic.topic}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-indigo-600">{topic.mentions?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-gray-700">{topic.engagement_score}/10</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-green-600">{topic.growth}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          topic.sentiment === 'very positive' ? 'bg-green-100 text-green-700' :
                          topic.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                          topic.sentiment === 'neutral' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {topic.sentiment === 'very positive' ? 'Muy Positivo' :
                           topic.sentiment === 'positive' ? 'Positivo' :
                           topic.sentiment === 'neutral' ? 'Neutral' : topic.sentiment}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {topic.top_brands?.slice(0, 2).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* GA4 Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('ga4')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between hover:from-green-600 hover:to-emerald-700 transition"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-lg font-bold">Google Analytics 4</h3>
              <p className="text-sm text-green-100">Conversión e intención de compra • Score: {scores.intent}/10</p>
            </div>
          </div>
          {expandedSections.ga4 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.ga4 && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Basado en tasa de conversión (leads calificados / sesiones totales) multiplicado por factor 150. Score alto indica fuerte intención de compra de visitantes del micrositio RAV4.</p>
                <p className="mt-2 text-xs text-green-700">
                  <strong>Fuente:</strong> GA4 Mock Data (demo) • <strong>Actualización:</strong> Diario cuando se integre • <strong>Property:</strong> Toyota Perú - RAV4 Microsite
                </p>
              </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{ga4Data?.overview?.totalUsers?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Sesiones</p>
                <p className="text-2xl font-bold text-gray-900">{ga4Data?.overview?.sessions?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Conversiones (Leads)</p>
                <p className="text-2xl font-bold text-green-600">{ga4Data?.overview?.conversions?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Tasa Conversión</p>
                <p className="text-2xl font-bold text-green-600">{(ga4Data?.overview?.conversionRate * 100)?.toFixed(1)}%</p>
              </div>
            </div>

            {/* Top Pages Table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Páginas Más Visitadas</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Página</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Views</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tiempo Promedio</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Exit Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ga4Data?.topPages?.map((page, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.page}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-green-600">{page.views?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{page.avgTimeOnPage}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{(page.exitRate * 100)?.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-green-600">{(page.conversionRate * 100)?.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Search Terms Table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Términos de Búsqueda en Sitio</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Término</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Búsquedas</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Clics</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Conv. Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ga4Data?.searchTerms?.map((term, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{term.term}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{term.searches?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{term.resultClicks?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-green-600">{(term.conversionRate * 100)?.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            term.trend === 'rising' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {term.trend === 'rising' ? '↑ Subiendo' : '→ Estable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keywords Reference */}
      <div className="bg-gradient-to-br from-toyota-red to-toyota-darkRed rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Car className="w-6 h-6" />
          Keywords Monitoreadas - Toyota RAV4 Híbrida
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Principales:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Toyota RAV4</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">RAV4 Híbrida</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">SUV Híbrida</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Intención:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Precio RAV4</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Test Drive</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Financiamiento</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Competencia:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Honda CR-V</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Mazda CX-5</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Nissan X-Trail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
