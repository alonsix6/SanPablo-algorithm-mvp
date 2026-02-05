import { useState, useEffect } from 'react';
import { TrendingUp, Search, Target, Heart, Zap, BarChart3, Calendar, GraduationCap, ChevronDown, X } from 'lucide-react';
import DataLayer from './DataLayer';
import DecisionLayer from './DecisionLayer';
import ExecutionLayer from './ExecutionLayer';
import OptimizationLayer from './OptimizationLayer';
import { BRAND_CONFIG, LAYER_CONFIG, UI_TEXT } from '../data/config';

// Quick preset options
const DATE_PRESETS = [
  { id: '3m', label: 'Últimos 3 meses' },
  { id: '6m', label: 'Últimos 6 meses' },
  { id: '12m', label: 'Último año' },
  { id: 'all', label: 'Todo el periodo' },
];

function presetToDates(presetId) {
  if (presetId === 'all') return { start: null, end: null };
  const months = { '3m': 3, '6m': 6, '12m': 12 }[presetId] || null;
  if (!months) return { start: null, end: null };
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

function formatDateLabel(start, end) {
  if (!start && !end) return 'Todo el periodo';
  const fmt = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (start) return `Desde ${fmt(start)}`;
  return `Hasta ${fmt(end)}`;
}

/**
 * Filter time-keyed data by start/end date range.
 * Auto-detects key format:
 *   - Monthly keys ("YYYY-MM"): included if any part of month overlaps range
 *   - Daily keys ("YYYY-MM-DD"): included if day falls within range
 */
export function filterMonthlyData(data, dateRange) {
  if (!data) return data;
  if (!dateRange || (!dateRange.start && !dateRange.end)) return data;

  const startDate = dateRange.start ? new Date(dateRange.start + 'T00:00:00') : null;
  const endDate = dateRange.end ? new Date(dateRange.end + 'T00:00:00') : null;

  const filtered = {};
  Object.entries(data).forEach(([key, value]) => {
    const parts = key.split('-');

    if (parts.length >= 3) {
      // Daily key: YYYY-MM-DD — exact day comparison
      const date = new Date(key + 'T00:00:00');
      const afterStart = !startDate || date >= startDate;
      const beforeEnd = !endDate || date <= endDate;
      if (afterStart && beforeEnd) filtered[key] = value;
    } else {
      // Monthly key: YYYY-MM — include if month overlaps range
      const [year, month] = parts.map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const afterStart = !startDate || monthEnd >= startDate;
      const beforeEnd = !endDate || monthStart <= endDate;
      if (afterStart && beforeEnd) filtered[key] = value;
    }
  });
  return filtered;
}

/**
 * Aggregate time-keyed data into chart-ready array with smart bucketing.
 * Daily data is aggregated based on entry count:
 *   ≤45 entries → daily bars, ≤180 → weekly, >180 → monthly
 * Monthly data passes through as-is.
 */
export function aggregateForChart(filteredData, valueKey) {
  if (!filteredData) return [];
  const entries = Object.entries(filteredData).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return [];

  const isDaily = entries[0][0].length === 10; // YYYY-MM-DD

  if (!isDaily) {
    return entries.map(([key, val]) => ({ date: key.substring(5), [valueKey]: val }));
  }

  if (entries.length <= 45) {
    // Show daily
    return entries.map(([key, val]) => ({ date: key.substring(5), [valueKey]: val }));
  }

  if (entries.length <= 180) {
    // Aggregate to ISO weeks
    const weeks = {};
    entries.forEach(([key, val]) => {
      const d = new Date(key + 'T00:00:00');
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const ws = new Date(d.getFullYear(), d.getMonth(), diff);
      const wk = ws.toISOString().slice(0, 10);
      weeks[wk] = (weeks[wk] || 0) + val;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({ date: key.substring(5), [valueKey]: val }));
  }

  // Aggregate to months
  const months = {};
  entries.forEach(([key, val]) => {
    const mk = key.substring(0, 7);
    months[mk] = (months[mk] || 0) + val;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({ date: key.substring(5), [valueKey]: val }));
}

/**
 * Sum a time-keyed numeric object filtered by date range.
 * Input:  { "YYYY-MM-DD": count, ... }
 * Output: total count within range
 */
export function sumFilteredData(data, dateRange) {
  const filtered = filterMonthlyData(data, dateRange);
  if (!filtered) return 0;
  return Object.values(filtered).reduce((sum, v) => sum + v, 0);
}

/**
 * Aggregate a time-keyed object-valued structure filtered by date range.
 * Input:  { "YYYY-MM-DD": { key: count, ... }, ... }
 * Output: { key: totalCount, ... }  (summed across all days in range)
 */
export function sumFilteredObjectData(data, dateRange) {
  const filtered = filterMonthlyData(data, dateRange);
  if (!filtered) return {};
  const result = {};
  Object.values(filtered).forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, count]) => {
        result[key] = (result[key] || 0) + count;
      });
    }
  });
  return result;
}

/**
 * Check if a dateRange is actively filtering (has start or end set).
 */
export function hasActiveDateFilter(dateRange) {
  return dateRange && (dateRange.start || dateRange.end);
}

/**
 * Extract the min/max date range from a daily-keyed data object.
 * Input: { "YYYY-MM-DD": value, ... }
 * Output: { min: "YYYY-MM-DD", max: "YYYY-MM-DD" } or null if no daily keys
 */
export function getDataDateRange(...dailyDataSources) {
  let allDates = [];
  for (const data of dailyDataSources) {
    if (!data) continue;
    const keys = Object.keys(data).filter(k => k.length === 10 && k[4] === '-');
    allDates.push(...keys);
  }
  if (allDates.length === 0) return null;
  allDates.sort();
  return { min: allDates[0], max: allDates[allDates.length - 1] };
}

/**
 * Check if a selected dateRange overlaps with available data coverage.
 * Returns true if there IS overlap (data will be shown), false if no overlap.
 */
export function dateRangeOverlapsData(dateRange, dataCoverage) {
  if (!dateRange || !dataCoverage) return true; // no filter or no coverage info = assume OK
  if (!dateRange.start && !dateRange.end) return true; // "Todo el periodo"
  const filterStart = dateRange.start ? new Date(dateRange.start) : null;
  const filterEnd = dateRange.end ? new Date(dateRange.end) : null;
  const dataStart = new Date(dataCoverage.min);
  const dataEnd = new Date(dataCoverage.max);
  if (filterEnd && dataStart > filterEnd) return false;
  if (filterStart && dataEnd < filterStart) return false;
  return true;
}

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('data');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [activePreset, setActivePreset] = useState('all');
  const [showDatePanel, setShowDatePanel] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    const interval = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const applyPreset = (presetId) => {
    setActivePreset(presetId);
    setDateRange(presetToDates(presetId));
  };

  const handleStartChange = (e) => {
    setActivePreset(null);
    setDateRange(prev => ({ ...prev, start: e.target.value || null }));
  };

  const handleEndChange = (e) => {
    setActivePreset(null);
    setDateRange(prev => ({ ...prev, end: e.target.value || null }));
  };

  const clearDates = () => {
    setActivePreset('all');
    setDateRange({ start: null, end: null });
  };

  const iconMap = { Search, Target, Zap, TrendingUp };

  const layers = [
    { id: 'data', name: LAYER_CONFIG.data.name, icon: iconMap[LAYER_CONFIG.data.icon], description: LAYER_CONFIG.data.description, color: LAYER_CONFIG.data.color },
    { id: 'decision', name: LAYER_CONFIG.decision.name, icon: iconMap[LAYER_CONFIG.decision.icon], description: LAYER_CONFIG.decision.description, color: LAYER_CONFIG.decision.color },
    { id: 'execution', name: LAYER_CONFIG.execution.name, icon: iconMap[LAYER_CONFIG.execution.icon], description: LAYER_CONFIG.execution.description, color: LAYER_CONFIG.execution.color },
    { id: 'optimization', name: LAYER_CONFIG.optimization.name, icon: iconMap[LAYER_CONFIG.optimization.icon], description: LAYER_CONFIG.optimization.description, color: LAYER_CONFIG.optimization.color },
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

  const hasDateFilter = dateRange.start || dateRange.end;

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
              {/* Date Range Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePanel(!showDatePanel)}
                  className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-lg transition-colors text-sm ${
                    hasDateFilter
                      ? 'bg-white/25 ring-1 ring-white/40'
                      : 'bg-white/15 hover:bg-white/25'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium max-w-[200px] truncate">
                    {formatDateLabel(dateRange.start, dateRange.end)}
                  </span>
                  <span className="sm:hidden font-medium">
                    {hasDateFilter ? 'Filtrado' : 'Fechas'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDatePanel ? 'rotate-180' : ''}`} />
                </button>

                {showDatePanel && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setShowDatePanel(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-[320px]">
                      {/* Presets */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Accesos rápidos</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {DATE_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => { applyPreset(preset.id); setShowDatePanel(false); }}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                activePreset === preset.id
                                  ? 'bg-ucsp-blue text-white'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rango personalizado</p>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Fecha inicio</label>
                            <input
                              type="date"
                              value={dateRange.start || ''}
                              onChange={handleStartChange}
                              max={dateRange.end || undefined}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-ucsp-blue focus:border-ucsp-blue"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Fecha fin</label>
                            <input
                              type="date"
                              value={dateRange.end || ''}
                              onChange={handleEndChange}
                              min={dateRange.start || undefined}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-ucsp-blue focus:border-ucsp-blue"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {hasDateFilter && (
                            <button
                              onClick={() => { clearDates(); setShowDatePanel(false); }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              <X className="w-3 h-3" /> Limpiar
                            </button>
                          )}
                          <button
                            onClick={() => setShowDatePanel(false)}
                            className="flex-1 px-3 py-2 bg-ucsp-blue text-white rounded-lg text-xs font-medium hover:bg-ucsp-blue/90 transition-colors"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
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
          {activeLayer === 'data' && <DataLayer dateRange={dateRange} />}
          {activeLayer === 'decision' && <DecisionLayer dateRange={dateRange} />}
          {activeLayer === 'execution' && <ExecutionLayer dateRange={dateRange} />}
          {activeLayer === 'optimization' && <OptimizationLayer dateRange={dateRange} />}
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
