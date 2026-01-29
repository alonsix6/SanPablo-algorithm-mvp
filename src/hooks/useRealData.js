import { useState, useEffect } from 'react';

/**
 * Hook para cargar datos reales de los JSON generados por el pipeline.
 * Lee desde public/data/ que es servido estáticamente por Vite/Netlify.
 *
 * Frecuencia: Los JSON se actualizan semanalmente (Lunes 8am via GitHub Actions).
 * El frontend los carga cada vez que el usuario abre la página.
 */

async function fetchJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function useHubSpotData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJSON('/data/hubspot/latest.json').then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

export function useMLData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJSON('/data/ml/predictions.json'),
      fetchJSON('/data/ml/insights.json'),
      fetchJSON('/data/ml/scores.json'),
      fetchJSON('/data/ml/recommendations.json'),
    ]).then(([predictions, insights, scores, recommendations]) => {
      setData({ predictions, insights, scores, recommendations });
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
