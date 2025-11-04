import { useState, useEffect } from 'react';
import { Search, TrendingUp, Video, Share2, Car, RefreshCw } from 'lucide-react';

export default function DataLayer() {
  const [trendsData, setTrendsData] = useState(null);
  const [tiktokData, setTiktokData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [trends, tiktok, meta] = await Promise.all([
        fetch('/data/trends/latest.json').then(r => r.json()).catch(() => null),
        fetch('/data/tiktok/latest.json').then(r => r.json()).catch(() => null),
        fetch('/data/meta/latest.json').then(r => r.json()).catch(() => null)
      ]);

      setTrendsData(trends);
      setTiktokData(tiktok);
      setMetaData(meta);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Capa de Data - Captura de Señales
            </h2>
            <p className="text-gray-600">
              Monitoreo en tiempo real del ecosistema digital automotriz en Perú
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-toyota-red text-white rounded-lg hover:bg-toyota-darkRed transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        {lastRefresh && (
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {lastRefresh.toLocaleString('es-PE')}
          </p>
        )}
      </div>

      {/* Google Trends Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Google Trends</h3>
              <p className="text-sm text-blue-100">Keywords automotrices en tendencia</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Keyword</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Interés</th>
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
                      kw.trend === 'rising'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {kw.trend === 'rising' ? '↑ Subiendo' : '→ Estable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TikTok Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">TikTok Creative Center</h3>
              <p className="text-sm text-pink-100">Hashtags automotrices virales</p>
            </div>
          </div>
        </div>

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
                      tag.region === 'Peru'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
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

      {/* Meta/Facebook Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Meta/Facebook Trends</h3>
              <p className="text-sm text-blue-100">Tendencias automotrices en redes sociales</p>
            </div>
          </div>
        </div>

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
