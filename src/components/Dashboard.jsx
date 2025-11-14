import { useState, useEffect } from 'react';
import { TrendingUp, Search, Target, Heart, Zap, BarChart3, Calendar, Car } from 'lucide-react';
import DataLayer from './DataLayer';
import DecisionLayer from './DecisionLayer';
import ExecutionLayer from './ExecutionLayer';
import OptimizationLayer from './OptimizationLayer';
import { BRAND_CONFIG, LAYER_CONFIG, UI_TEXT } from '../data/config';

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('data');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => setLoading(false), 800);
    
    // Actualizar timestamp cada minuto
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const iconMap = {
    Search,
    Target,
    Zap,
    TrendingUp,
  };

  const layers = [
    {
      id: 'data',
      name: LAYER_CONFIG.data.name,
      icon: iconMap[LAYER_CONFIG.data.icon],
      description: LAYER_CONFIG.data.description,
      color: LAYER_CONFIG.data.color
    },
    {
      id: 'decision',
      name: LAYER_CONFIG.decision.name,
      icon: iconMap[LAYER_CONFIG.decision.icon],
      description: LAYER_CONFIG.decision.description,
      color: LAYER_CONFIG.decision.color
    },
    {
      id: 'execution',
      name: LAYER_CONFIG.execution.name,
      icon: iconMap[LAYER_CONFIG.execution.icon],
      description: LAYER_CONFIG.execution.description,
      color: LAYER_CONFIG.execution.color
    },
    {
      id: 'optimization',
      name: LAYER_CONFIG.optimization.name,
      icon: iconMap[LAYER_CONFIG.optimization.icon],
      description: LAYER_CONFIG.optimization.description,
      color: LAYER_CONFIG.optimization.color
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-honda flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">{UI_TEXT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-honda text-white shadow-honda-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Car className="w-7 h-7 sm:w-8 sm:h-8 text-honda-red" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{BRAND_CONFIG.name}</h1>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {BRAND_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              <div className="text-right">
                <p className="text-xs text-white/70 flex items-center justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{UI_TEXT.lastUpdate}</span>
                  <span className="sm:hidden">Actualizado</span>
                </p>
                <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {lastUpdate.toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 hover:bg-white/30 transition-colors">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layer Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;

              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`
                    flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-r ${layer.color} text-white shadow-lg transform hover:shadow-xl`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold whitespace-nowrap">{layer.name}</p>
                    <p className={`text-[10px] whitespace-nowrap ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {layer.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {activeLayer === 'data' && <DataLayer />}
          {activeLayer === 'decision' && <DecisionLayer />}
          {activeLayer === 'execution' && <ExecutionLayer />}
          {activeLayer === 'optimization' && <OptimizationLayer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
            <p className="text-xs sm:text-sm text-center sm:text-left">
              {UI_TEXT.footer.copyright}
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-honda-red rounded-full animate-pulse"></div>
                {UI_TEXT.systemActive}
              </span>
              <span className="text-honda-red font-semibold text-xs sm:text-sm">{UI_TEXT.footer.version}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
