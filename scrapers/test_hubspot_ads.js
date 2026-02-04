#!/usr/bin/env node
/**
 * Test script: HubSpot Ads & Campaign Data Probe
 *
 * Prueba qué datos de anuncios y campañas podemos obtener
 * con el token actual de HubSpot.
 *
 * Uso:
 *   cd scrapers && node test_hubspot_ads.js
 *
 * Requiere: HUBSPOT_ACCESS_TOKEN en .env o variable de entorno
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const BASE = 'https://api.hubapi.com';

if (!TOKEN) {
  console.error('ERROR: HUBSPOT_ACCESS_TOKEN no configurado');
  console.error('Configura en .env o como variable de entorno');
  process.exit(1);
}

async function api(endpoint) {
  try {
    const res = await axios.get(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      timeout: 15000
    });
    return { ok: true, data: res.data, status: res.status };
  } catch (err) {
    const status = err.response?.status || 'NETWORK_ERROR';
    const detail = err.response?.data || err.message;
    return { ok: false, status, detail };
  }
}

function line() { console.log('─'.repeat(60)); }

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  HubSpot Ads & Campaign Data Probe                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ─── Test 1: List marketing campaigns ───
  console.log('TEST 1: Listar campañas de marketing');
  line();
  const props = 'hs_name,hs_campaign_status,hs_start_date,hs_end_date,hs_budget_items_sum_amount,hs_spend_items_sum_amount';
  const campRes = await api(`/marketing/v3/campaigns?properties=${props}&limit=20`);

  if (!campRes.ok) {
    console.log(`  ❌ FALLO (${campRes.status}): ${JSON.stringify(campRes.detail)}`);
    console.log('  → Scope necesario: marketing.campaigns.read\n');
  } else {
    const campaigns = campRes.data.results || [];
    console.log(`  ✅ OK — ${campaigns.length} campañas encontradas`);

    campaigns.slice(0, 5).forEach(c => {
      const p = c.properties || {};
      console.log(`     • ${p.hs_name || 'Sin nombre'} [${p.hs_campaign_status || '?'}]`);
      console.log(`       Spend: $${p.hs_spend_items_sum_amount || '0'} | Budget: $${p.hs_budget_items_sum_amount || '0'}`);
      console.log(`       Fechas: ${p.hs_start_date || '?'} → ${p.hs_end_date || '?'}`);
    });

    // ─── Test 2: Assets AD_CAMPAIGN for first campaign ───
    if (campaigns.length > 0) {
      const firstId = campaigns[0].id;
      const firstName = campaigns[0].properties?.hs_name || campaigns[0].id;

      console.log(`\nTEST 2: Assets AD_CAMPAIGN de "${firstName}"`);
      line();
      const assetsRes = await api(`/marketing/v3/campaigns/${firstId}/assets/AD_CAMPAIGN?limit=50`);

      if (!assetsRes.ok) {
        console.log(`  ❌ FALLO (${assetsRes.status}): ${JSON.stringify(assetsRes.detail)}`);
        console.log('  → Puede que no haya ads asociados o falta scope');
      } else {
        const assets = assetsRes.data.results || [];
        console.log(`  ✅ OK — ${assets.length} ad campaigns asociadas`);
        assets.slice(0, 10).forEach(a => {
          console.log(`     • ID: ${a.id} | Name: ${a.name || a.properties?.name || JSON.stringify(a)}`);
        });
        if (assets.length === 0) {
          console.log('  ℹ️  No hay ad campaigns asociadas a esta campaña de marketing');
        }
      }

      // ─── Test 3: Revenue report for first campaign ───
      console.log(`\nTEST 3: Revenue report de "${firstName}"`);
      line();
      const revRes = await api(`/marketing/v3/campaigns/${firstId}/reports/revenue?attributionModel=LINEAR`);

      if (!revRes.ok) {
        console.log(`  ❌ FALLO (${revRes.status}): ${JSON.stringify(revRes.detail)}`);
        console.log('  → Scope necesario: marketing.campaigns.revenue.read');
      } else {
        console.log(`  ✅ OK — Revenue data:`);
        console.log(`     ${JSON.stringify(revRes.data, null, 2)}`);
      }

      // ─── Test 4: Revenue with date filter ───
      console.log(`\nTEST 4: Revenue report con filtro de fecha (2024-01-01 a 2025-12-31)`);
      line();
      const revDateRes = await api(`/marketing/v3/campaigns/${firstId}/reports/revenue?attributionModel=LINEAR&startDate=2024-01-01&endDate=2025-12-31`);

      if (!revDateRes.ok) {
        console.log(`  ❌ FALLO (${revDateRes.status}): ${JSON.stringify(revDateRes.detail)}`);
      } else {
        console.log(`  ✅ OK — Revenue data (filtered):`);
        console.log(`     ${JSON.stringify(revDateRes.data, null, 2)}`);
      }

      // ─── Test 5: All asset types ───
      console.log(`\nTEST 5: Todos los asset types de "${firstName}"`);
      line();
      const assetTypes = [
        'AD_CAMPAIGN', 'BLOG_POST', 'LANDING_PAGE', 'MARKETING_EMAIL',
        'SOCIAL_BROADCAST', 'FORM', 'EXTERNAL_WEB_URL', 'CTA',
        'WEB_INTERACTIVE', 'MARKETING_SMS', 'MARKETING_EVENT'
      ];

      for (const type of assetTypes) {
        const res = await api(`/marketing/v3/campaigns/${firstId}/assets/${type}?limit=5`);
        if (res.ok) {
          const count = res.data.results?.length || 0;
          const total = res.data.total || count;
          if (total > 0) {
            console.log(`  ✅ ${type}: ${total} assets`);
            (res.data.results || []).forEach(a => {
              const name = a.name || a.properties?.hs_name || a.id;
              console.log(`     • ${name}`);
            });
          }
        } else {
          console.log(`  ❌ ${type}: ${res.status}`);
        }
      }
    }
  }

  // ─── Test 6: Legacy Ads API ───
  console.log('\nTEST 6: Legacy Ads API v1 (/ads/v1/campaigns)');
  line();
  const legacyRes = await api('/ads/v1/campaigns');
  if (!legacyRes.ok) {
    console.log(`  ❌ FALLO (${legacyRes.status}): No disponible`);
  } else {
    console.log(`  ✅ OK — Legacy ads data:`);
    const results = Array.isArray(legacyRes.data) ? legacyRes.data : (legacyRes.data.results || []);
    console.log(`     ${results.length} ad campaigns`);
    results.slice(0, 5).forEach(a => {
      console.log(`     • ${JSON.stringify(a).substring(0, 200)}`);
    });
  }

  // ─── Test 7: Ads v3 (undocumented) ───
  console.log('\nTEST 7: Ads endpoints exploratorios');
  line();
  const adsEndpoints = [
    '/marketing/v3/ads',
    '/marketing/v3/ads/campaigns',
    '/ads/v3/campaigns',
    '/marketing/v1/ads/campaigns',
  ];
  for (const ep of adsEndpoints) {
    const res = await api(ep);
    console.log(`  ${res.ok ? '✅' : '❌'} ${ep} → ${res.ok ? 'OK' : res.status}`);
    if (res.ok) {
      console.log(`     ${JSON.stringify(res.data).substring(0, 300)}`);
    }
  }

  // ─── Test 8: Analytics API - Paid sources ───
  console.log('\nTEST 8: Analytics API — Paid traffic sources (daily)');
  line();
  const analyticsRes = await api('/analytics/v2/reports/sources/daily?start=20250101&end=20250630');
  if (!analyticsRes.ok) {
    console.log(`  ❌ FALLO (${analyticsRes.status}): ${JSON.stringify(analyticsRes.detail).substring(0, 200)}`);
    console.log('  → Scope necesario: business-intelligence (solo Marketing Hub Enterprise + OAuth)');
  } else {
    console.log(`  ✅ OK — Analytics data disponible`);
    const keys = Object.keys(analyticsRes.data || {}).slice(0, 5);
    console.log(`     Top keys: ${keys.join(', ')}`);
  }

  // ─── Test 9: Revenue report for ALL campaigns ───
  if (campRes.ok) {
    const campaigns = campRes.data.results || [];
    console.log(`\nTEST 9: Revenue report para TODAS las campañas (${campaigns.length})`);
    line();

    const campaignRevenues = [];
    for (const c of campaigns) {
      const name = c.properties?.hs_name || c.id;
      const revRes = await api(`/marketing/v3/campaigns/${c.id}/reports/revenue?attributionModel=LINEAR`);
      if (revRes.ok && revRes.data) {
        const d = revRes.data;
        if (d.contactsNumber > 0 || d.dealsNumber > 0 || d.revenueAmount > 0) {
          campaignRevenues.push({ name, ...d });
          console.log(`  ✅ ${name}: ${d.contactsNumber} contactos, ${d.dealsNumber} deals, $${d.revenueAmount || 0} revenue`);
        }
      } else if (!revRes.ok && revRes.status === 403) {
        console.log(`  ❌ Sin permiso — necesitas scope: marketing.campaigns.revenue.read`);
        break;
      }
    }

    if (campaignRevenues.length === 0 && campRes.ok) {
      console.log('  ℹ️  Ninguna campaña tiene revenue atribuido (o falta scope)');
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('RESUMEN DE SCOPES NECESARIOS:');
  console.log('  • marketing.campaigns.read — listar campañas y assets');
  console.log('  • marketing.campaigns.revenue.read — revenue por campaña');
  console.log('  • business-intelligence — analytics API (solo Enterprise)');
  console.log('═'.repeat(60));
}

main().catch(console.error);
