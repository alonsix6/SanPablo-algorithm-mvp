import { useState, useEffect } from 'react';
import { TrendingUp, Search, Target, Heart, Zap, BarChart3, Calendar, GraduationCap, ChevronDown } from 'lucide-react';
import DataLayer from './DataLayer';
import DecisionLayer from './DecisionLayer';
import ExecutionLayer from './ExecutionLayer';
import OptimizationLayer from './OptimizationLayer';
import { BRAND_CONFIG, LAYER_CONFIG, UI_TEXT } from '../data/config';

// Date filter options
const DATE_FILTERS = [
  { id: '3m', label: 'Últimos 3 meses', months: 3 },
  { id: '6m', label: 'Últimos 6 meses', months: 6 },
  { id: '12m', label: 'Último año', months: 12 },
  { id: 'all', label: 'Todo el periodo', months: null },
];

/**
 * Filter monthly data entries by the selected date range.
 * monthlyData: { "2025-01": 100, "2025-02": 200, ... }
 * months: number of months back from today, or null for all.
 */
export function filterMonthlyData(monthlyData, months) {
  if (!monthlyData || !months) return monthlyData;

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);

  const filtered = {};
  Object.entries(monthlyData).forEach(([key, value]) => {
    const [year, month] = key.split('-').map(Number);
    const entryDate = new Date(year, month - 1, 1);
    if (entryDate >= cutoff) {
      filtered[key] = value;
    }
  });
  return filtered;
}

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('data');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

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
      <div className="min-h-screen bg-gradient-ucsp flex items-center justify-center">
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
      <header className="bg-gradient-ucsp text-white shadow-ucsp-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-ucsp-blue" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{BRAND_CONFIG.name}</h1>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {BRAND_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              {/* Date Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">
                    {DATE_FILTERS.find(f => f.id === dateFilter)?.label}
                  </span>
                  <span className="sm:hidden font-medium">
                    {dateFilter === 'all' ? 'Todo' : dateFilter.toUpperCase()}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showDateDropdown && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setShowDateDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]">
                      {DATE_FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            setDateFilter(filter.id);
                            setShowDateDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            dateFilter === filter.id
                              ? 'bg-ucsp-blue/10 text-ucsp-blue font-bold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-white/70 flex items-center justify-end gap-1.5">
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
          {activeLayer === 'data' && <DataLayer dateFilter={dateFilter} />}
          {activeLayer === 'decision' && <DecisionLayer dateFilter={dateFilter} />}
          {activeLayer === 'execution' && <ExecutionLayer dateFilter={dateFilter} />}
          {activeLayer === 'optimization' && <OptimizationLayer dateFilter={dateFilter} />}
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
                <div className="w-2 h-2 bg-ucsp-blue rounded-full animate-pulse"></div>
                {UI_TEXT.systemActive}
              </span>
              <span className="text-ucsp-blue font-semibold text-xs sm:text-sm">{UI_TEXT.footer.version}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
