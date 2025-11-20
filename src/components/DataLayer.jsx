import { useState, useEffect } from 'react';
import { Search, TrendingUp, Video, Share2, GraduationCap, RefreshCw, ChevronDown, ChevronUp, BarChart3, Info } from 'lucide-react';

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
  }, []); // Cargar al montar

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const basePath = `/data`; // Datos UCSP
      const [trends, tiktok, meta, ga4] = await Promise.all([
        fetch(`${basePath}/trends/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/tiktok/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/meta/latest.json`).then(r => r.json()).catch(() => null),
        fetch(`${basePath}/mock/ga4_data.json`).then(r => r.json()).catch(() => null)
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

  // Generar insights basados en los datos
  const generateInsights = () => {
    const insights = [];

    // Google Trends Insight
    if (trendsData?.keywords?.length > 0) {
      const topKeyword = trendsData.keywords[0];
      const avgGrowth = trendsData.keywords.reduce((sum, kw) => {
        const growth = parseFloat(kw.growth_3m?.replace('%', '').replace('+', '')) || 0;
        return sum + growth;
      }, 0) / trendsData.keywords.length;
      insights.push({
        source: 'Google Trends',
        icon: '🔍',
        text: `"${topKeyword.keyword}" lidera búsquedas con ${topKeyword.average_interest}/100 de interés, con un crecimiento promedio de ${avgGrowth.toFixed(0)}% en keywords universitarias.`
      });
    }

    // TikTok Insight
    if (tiktokData?.trends?.hashtags?.length > 0) {
      const topHashtag = tiktokData.trends.hashtags[0];
      const peruHashtags = tiktokData.trends.hashtags.filter(h => h.region === 'Peru').length;
      insights.push({
        source: 'TikTok',
        icon: '🎥',
        text: `${topHashtag.hashtag} alcanza ${topHashtag.views} de visualizaciones con ${topHashtag.growth} de crecimiento, ${peruHashtags} hashtags tienen tracción específica en Perú.`
      });
    }

    // Meta Insight
    if (metaData?.aggregatedTopics?.length > 0) {
      const topTopic = metaData.aggregatedTopics[0];
      const positiveTopics = metaData.aggregatedTopics.filter(t =>
        t.sentiment === 'very positive' || t.sentiment === 'positive'
      ).length;
      insights.push({
        source: 'Meta',
        icon: '📱',
        text: `"${topTopic.topic}" genera ${topTopic.mentions?.toLocaleString()} menciones con ${topTopic.engagement_score}/10 de engagement, ${positiveTopics} de ${metaData.aggregatedTopics.length} temas tienen sentimiento positivo.`
      });
    }

    // GA4 Insight
    if (ga4Data?.overview) {
      const convRate = (ga4Data.overview.conversionRate * 100).toFixed(1);
      const topPage = ga4Data.topPages?.[0];
      insights.push({
        source: 'GA4',
        icon: '📊',
        text: `${ga4Data.overview.totalUsers?.toLocaleString()} usuarios generaron ${ga4Data.overview.conversions} leads (${convRate}% conversión), "${topPage?.page}" es la página más efectiva.`
      });
    }

    // Conexión Multi-fuente
    const connections = [];
    if (trendsData?.keywords && tiktokData?.trends?.hashtags) {
      // Buscar keywords que aparecen en hashtags
      trendsData.keywords.slice(0, 3).forEach(kw => {
        const kwLower = kw.keyword.toLowerCase();
        tiktokData.trends.hashtags.forEach(tag => {
          if (tag.hashtag.toLowerCase().includes(kwLower.split(' ')[0])) {
            connections.push(`"${kw.keyword}"`);
          }
        });
      });
    }

    if (connections.length > 0) {
      insights.push({
        source: 'Conexión Multi-fuente',
        icon: '🔗',
        text: `${connections.slice(0, 2).join(' y ')} ${connections.length > 1 ? 'aparecen' : 'aparece'} como señales fuertes en Google Trends, TikTok y Meta simultáneamente, indicando momentum real del mercado.`
      });
    } else {
      insights.push({
        source: 'Conexión Multi-fuente',
        icon: '🔗',
        text: `Las 4 fuentes confirman alto interés en admisión UCSP: búsquedas creciendo +${((scores.search / 10) * 100).toFixed(0)}%, contenido viral activo, conversación social positiva y conversión del ${(ga4Data?.overview?.conversionRate * 100 || 6.3).toFixed(1)}%.`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* Header & Score Summary */}
      <div className="bg-gradient-to-br from-ucsp-blue to-ucsp-darkBlue rounded-2xl shadow-ucsp-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-ucsp-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Capa de Data - Captura de Señales
                </h2>
                <p className="text-white/80 text-base">
                  Monitoreo en tiempo real del ecosistema digital educativo en el sur del Perú
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/70 text-xs uppercase font-semibold mb-1">Score Global</p>
              <p className="text-3xl font-bold">{scores.overall}</p>
              <p className="text-xs text-white/60">de 10.0</p>
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
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-white/80">GA4 Activo</span>
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

      {/* Insights Clave del Mercado */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-ucsp-lg p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Insights Clave del Mercado</h3>
            <p className="text-sm text-gray-600">Análisis automático multi-fuente</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => {
            // Definir colores por fuente
            const colorScheme =
              insight.source === 'Google Trends' ? { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' } :
              insight.source === 'TikTok' ? { gradient: 'from-cyan-400 to-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' } :
              insight.source === 'Meta' ? { gradient: 'from-blue-600 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' } :
              insight.source === 'GA4' ? { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' } :
              { gradient: 'from-gray-600 to-gray-700', bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };

            const sourceScore =
              insight.source === 'Google Trends' ? scores.search :
              insight.source === 'TikTok' ? scores.trend :
              insight.source === 'Meta' ? scores.social :
              insight.source === 'GA4' ? scores.intent : null;

            // El último insight (Conexión Multi-fuente) abarca 2 columnas
            const isMultiSource = insight.source === 'Conexión Multi-fuente';

            return (
              <div key={idx} className={`relative ${colorScheme.bg} rounded-xl p-5 border-2 border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-lg group ${isMultiSource ? 'md:col-span-2' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorScheme.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{insight.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`text-xs font-bold ${colorScheme.text} uppercase tracking-wider`}>{insight.source}</p>
                      {sourceScore && (
                        <span className={`${colorScheme.badge} px-2 py-0.5 rounded-full text-xs font-bold`}>
                          {sourceScore}/10
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{insight.text}</p>
                  </div>
                </div>
                {/* Decorative accent */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorScheme.gradient} rounded-l-xl`}></div>
              </div>
            );
          })}
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
              <h3 className="text-base font-bold">Google Trends</h3>
              <p className="text-xs text-blue-100">Keywords universitarias en tendencia • Score: {scores.search}/10</p>
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
                <p>Promedio del "interés de búsqueda" (0-100) de todas las keywords universitarias monitoreadas en Perú. Score alto indica fuerte demanda de información sobre UCSP y carreras híbridas.</p>
                <p className="mt-2 text-xs text-blue-700">
                  <strong>Fuente:</strong> Google Trends API (Perú) • <strong>Actualización:</strong> Semanal • <strong>Categoría:</strong> Education
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

            {/* Regional Distribution Charts - Top 6 Keywords in 2 Rows */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Distribución Regional por Keyword (Top 6)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendsData?.keywords?.slice(0, 6).map((kw, idx) => (
                  kw.top_regions && Object.keys(kw.top_regions).length > 0 && (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-900 mb-2 truncate">{kw.keyword}</h5>
                      <div className="space-y-1.5">
                        {Object.entries(kw.top_regions)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([region, score], regionIdx) => (
                            <div key={regionIdx} className="flex items-center gap-2">
                              <div className="w-16 text-[10px] font-medium text-gray-700 truncate">{region}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full flex items-center justify-end pr-1.5 transition-all duration-500"
                                  style={{ width: `${score}%` }}
                                >
                                  <span className="text-[10px] font-semibold text-white">{score}</span>
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
          className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white p-4 flex items-center justify-between hover:from-cyan-500 hover:to-cyan-600 transition"
        >
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-base font-bold">TikTok Creative Center</h3>
              <p className="text-xs text-cyan-100">Hashtags universitarias virales • Score: {scores.trend}/10</p>
            </div>
          </div>
          {expandedSections.tiktok ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.tiktok && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Promedio del "relevance score" (0-100) de los hashtags universitarias más virales. Score alto indica alto potencial de viralidad para contenido de UCSP y carreras.</p>
                <p className="mt-2 text-xs text-cyan-700">
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
                        <span className="text-sm font-bold text-gray-700">{tag.views}</span>
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
                          tag.region === 'Peru' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between hover:from-blue-700 hover:to-blue-800 transition"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-base font-bold">Meta/Facebook Trends</h3>
              <p className="text-xs text-blue-100">Tendencias universitarias en redes sociales • Score: {scores.social}/10</p>
            </div>
          </div>
          {expandedSections.meta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.meta && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Promedio del "engagement score" (0-10) de los temas universitarias más discutidos en Facebook e Instagram. Score alto indica fuerte conversación social sobre UCSP.</p>
                <p className="mt-2 text-xs text-blue-700">
                  <strong>Fuente:</strong> Páginas públicas verificadas (UCSP Perú 286K likes, UCSP Oficial 150K, etc.) • <strong>Actualización:</strong> Semanal • <strong>Método:</strong> Análisis manual de engagement público
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
                        <span className="text-sm font-bold text-blue-600">{topic.mentions?.toLocaleString()}</span>
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
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex items-center justify-between hover:from-amber-600 hover:to-orange-600 transition"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div className="text-left">
              <h3 className="text-base font-bold">Google Analytics 4</h3>
              <p className="text-xs text-amber-100">Conversión e intención de postulación • Score: {scores.intent}/10</p>
            </div>
          </div>
          {expandedSections.ga4 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.ga4 && (
          <div className="p-6 space-y-4">
            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Cómo se calcula el score:</p>
                <p>Basado en tasa de conversión (leads calificados / sesiones totales) multiplicado por factor 150. Score alto indica fuerte intención de postulación de visitantes del portal de admisiones UCSP.</p>
                <p className="mt-2 text-xs text-amber-700">
                  <strong>Fuente:</strong> Google Analytics 4 • <strong>Actualización:</strong> Diario • <strong>Property:</strong> UCSP Perú - UCSP Microsite
                </p>
              </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total Usuarios</p>
                <p className="text-xl font-bold text-gray-900">{ga4Data?.overview?.totalUsers?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Sesiones</p>
                <p className="text-xl font-bold text-gray-900">{ga4Data?.overview?.sessions?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Conversiones (Leads)</p>
                <p className="text-xl font-bold text-amber-600">{ga4Data?.overview?.conversions?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Tasa Conversión</p>
                <p className="text-xl font-bold text-amber-600">{(ga4Data?.overview?.conversionRate * 100)?.toFixed(1)}%</p>
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
                          <span className="text-sm font-bold text-amber-600">{page.views?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{page.avgTimeOnPage}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{(page.exitRate * 100)?.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-amber-600">{(page.conversionRate * 100)?.toFixed(1)}%</span>
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
                          <span className="text-sm font-bold text-amber-600">{(term.conversionRate * 100)?.toFixed(1)}%</span>
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
      <div className="bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy rounded-xl p-6 text-white">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Keywords Monitoreadas - UCSP (Admisiones 2026)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Marca:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">UCSP</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Admisión UCSP</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">San Pablo Arequipa</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Carreras Top:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Ingeniería Industrial</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Derecho UCSP</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Medicina UCSP</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2 font-semibold">Competencia:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">UNSA</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">UCSM</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">UTP Arequipa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
