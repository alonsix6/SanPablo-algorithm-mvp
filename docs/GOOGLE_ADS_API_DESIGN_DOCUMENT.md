# Google Ads API Integration - Technical Design Document

**Document Version:** 1.0
**Date:** February 2026
**Company:** Reset Digital Marketing Agency
**Product:** Reset Algorithm - Marketing Intelligence Platform

---

## 1. Executive Summary

Reset Algorithm is a marketing intelligence and reporting platform developed by Reset Digital Marketing Agency. The platform aggregates data from multiple marketing channels to provide unified reporting, performance analytics, and budget optimization insights for our managed client accounts.

We are requesting **Basic Access** to the Google Ads API to enable read-only reporting capabilities for the accounts managed through our MCC (Manager Account).

**Primary Use Case:** Automated reporting and analytics dashboard
**API Access Type:** Read-only (no campaign modifications)
**Number of Managed Accounts:** 10-50 client accounts

---

## 2. Company Overview

### 2.1 About Reset Digital Marketing Agency

Reset is a digital marketing agency based in Peru, specializing in performance marketing for educational institutions and B2B companies. We manage digital advertising campaigns across multiple platforms including Google Ads, Meta Ads, and programmatic channels.

### 2.2 Current Operations

- **MCC Account:** We operate a Google Ads Manager Account (MCC) containing multiple client accounts
- **Services:** Campaign management, performance reporting, budget optimization
- **Clients:** Universities, educational institutions, B2B companies
- **Geographic Focus:** Latin America (Peru, Chile, Colombia, Mexico)

---

## 3. Product Description

### 3.1 Reset Algorithm Platform

Reset Algorithm is an internal marketing intelligence platform that:

1. **Aggregates Data** from multiple marketing sources (Google Ads, Meta Ads, Google Analytics, CRM)
2. **Generates Reports** with unified metrics and KPIs
3. **Provides Insights** for budget allocation and optimization decisions
4. **Monitors Performance** with automated alerts and dashboards

### 3.2 Key Features

| Feature | Description |
|---------|-------------|
| Multi-channel Dashboard | Unified view of all marketing channels |
| Automated Reporting | Daily/weekly performance reports |
| Budget Monitoring | Track spend and pacing across accounts |
| CPL/CPA Tracking | Cost-per-lead and cost-per-acquisition analysis |
| ROI Analysis | Return on investment calculations |
| Alert System | Notifications for budget limits and performance anomalies |

### 3.3 Technology Stack

- **Backend:** Node.js (ES Modules)
- **Data Storage:** JSON files, PostgreSQL (planned)
- **Automation:** GitHub Actions (scheduled workflows)
- **Frontend:** React.js dashboard
- **Hosting:** GitHub Pages / Vercel

---

## 4. Google Ads API Integration

### 4.1 Purpose of Integration

We need Google Ads API access to:

1. **Fetch campaign performance data** for reporting dashboards
2. **Monitor budget utilization** across managed accounts
3. **Calculate unified KPIs** (CPL, CPA, ROAS) combining Google Ads with other data sources
4. **Generate automated reports** for clients and internal teams

### 4.2 API Usage - Read-Only Operations

We will **ONLY** use read-only API operations. No campaign modifications will be performed.

#### 4.2.1 Resources We Will Access

| Resource | Purpose | Frequency |
|----------|---------|-----------|
| `customers` | List managed accounts in MCC | Daily |
| `campaigns` | Campaign names, status, settings | Daily |
| `ad_groups` | Ad group structure and settings | Daily |
| `metrics` | Performance data (clicks, impressions, cost, conversions) | Daily |
| `segments` | Date, device, geographic breakdowns | Daily |

#### 4.2.2 Metrics We Will Retrieve

```
- impressions
- clicks
- cost_micros
- conversions
- conversions_value
- average_cpc
- ctr (click-through rate)
- average_cost
- cost_per_conversion
```

#### 4.2.3 API Methods Used

| Method | Description |
|--------|-------------|
| `GoogleAdsService.Search` | Query campaign and metrics data |
| `GoogleAdsService.SearchStream` | Stream large result sets |
| `CustomerService.ListAccessibleCustomers` | List accounts in MCC |

### 4.3 What We Will NOT Do

- **No campaign creation or modification**
- **No bid adjustments**
- **No budget changes**
- **No ad creation or editing**
- **No keyword modifications**
- **No automated bidding strategies**

---

## 5. Technical Architecture

### 5.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Reset Algorithm Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Scheduler  │    │  Data Layer  │    │  Dashboard   │      │
│  │   (GitHub    │───▶│  (Scrapers)  │───▶│   (React)    │      │
│  │   Actions)   │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Data Sources                          │   │
│  ├─────────────┬─────────────┬─────────────┬───────────────┤   │
│  │ Google Ads  │   Meta Ads  │    GA4      │   HubSpot    │   │
│  │    API      │   (Apify)   │    API      │     API      │   │
│  └─────────────┴─────────────┴─────────────┴───────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow

```
1. Scheduled Trigger (GitHub Actions)
         │
         ▼
2. Google Ads API Request
   - Authenticate with OAuth 2.0
   - Query campaign metrics via GAQL
         │
         ▼
3. Data Processing
   - Parse API response
   - Calculate derived metrics (CPL, ROAS)
   - Merge with other data sources
         │
         ▼
4. Data Storage
   - Save to JSON files
   - Update dashboard data
         │
         ▼
5. Dashboard Display
   - React frontend renders data
   - Users view reports
```

### 5.3 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Reset     │     │   Google    │     │  Google Ads │
│  Algorithm  │────▶│   OAuth     │────▶│     API     │
│             │     │   Server    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │  1. Request       │                    │
      │     Token         │                    │
      │──────────────────▶│                    │
      │                   │                    │
      │  2. Access        │                    │
      │     Token         │                    │
      │◀──────────────────│                    │
      │                   │                    │
      │  3. API Request with Token             │
      │───────────────────────────────────────▶│
      │                   │                    │
      │  4. Campaign Data                      │
      │◀───────────────────────────────────────│
```

### 5.4 Code Structure

```
scrapers/
├── google_ads_api.js      # Google Ads API connector
├── ga4_api.js             # Google Analytics 4 connector
├── hubspot_api.js         # HubSpot CRM connector
├── meta_apify.js          # Meta/Facebook connector
└── config/
    └── ucsp.json          # Client configuration

.github/workflows/
├── scrape-data.yml        # Weekly full data fetch
└── scrape-daily.yml       # Daily incremental updates
```

---

## 6. Data Security & Privacy

### 6.1 Credential Management

| Credential | Storage Method | Access Control |
|------------|----------------|----------------|
| OAuth Client ID | GitHub Secrets | Repository admins only |
| OAuth Client Secret | GitHub Secrets | Repository admins only |
| Refresh Token | GitHub Secrets | Repository admins only |
| Developer Token | GitHub Secrets | Repository admins only |

### 6.2 Security Measures

1. **Encrypted Storage:** All credentials stored in GitHub Secrets (encrypted at rest)
2. **No Hardcoded Credentials:** All secrets loaded from environment variables
3. **Minimal Permissions:** Read-only access requested
4. **Audit Logging:** All API calls logged with timestamps
5. **Access Control:** Only authorized team members can access credentials

### 6.3 Data Handling

- **No PII Storage:** We do not store personally identifiable information
- **Aggregated Metrics Only:** Only campaign-level metrics are stored
- **Data Retention:** Performance data retained for 2 years for historical analysis
- **No Data Sharing:** Client data is never shared with third parties

### 6.4 Compliance

- GDPR compliant data handling practices
- Google Ads API Terms of Service compliance
- Client data confidentiality agreements in place

---

## 7. API Usage Estimates

### 7.1 Request Volume

| Operation | Frequency | Accounts | Est. Requests/Day |
|-----------|-----------|----------|-------------------|
| List Customers | Daily | 1 MCC | 1 |
| Campaign Metrics | Daily | 50 | 50 |
| Ad Group Metrics | Daily | 50 | 50 |
| Geographic Report | Weekly | 50 | 7 |
| Device Report | Weekly | 50 | 7 |

**Total Estimated Daily Requests:** ~100-200 requests/day
**Total Estimated Monthly Requests:** ~3,000-6,000 requests/month

### 7.2 Rate Limiting Compliance

- We implement exponential backoff for rate limit errors
- Requests are batched to minimize API calls
- Daily data fetches are scheduled during off-peak hours (8 AM local time)

---

## 8. Sample API Queries

### 8.1 Campaign Performance Query (GAQL)

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  segments.date
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
```

### 8.2 Account Summary Query

```sql
SELECT
  customer.id,
  customer.descriptive_name,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM customer
WHERE segments.date DURING LAST_7_DAYS
```

---

## 9. Error Handling

### 9.1 Error Handling Strategy

```javascript
async function fetchWithRetry(query, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await googleAdsClient.search(query);
    } catch (error) {
      if (error.code === 'RESOURCE_EXHAUSTED' && attempt < maxRetries) {
        // Rate limited - exponential backoff
        const waitMs = Math.pow(2, attempt) * 1000;
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
}
```

### 9.2 Monitored Error Types

| Error Type | Action |
|------------|--------|
| RESOURCE_EXHAUSTED | Exponential backoff retry |
| AUTHENTICATION_ERROR | Alert team, refresh credentials |
| PERMISSION_DENIED | Log error, notify admin |
| INTERNAL_ERROR | Retry with backoff |

---

## 10. Support & Contact

### 10.1 Technical Contact

**Name:** Reset Development Team
**Email:** dev@resetagencia.com
**Role:** Platform Development

### 10.2 Business Contact

**Company:** Reset Digital Marketing Agency
**Website:** https://resetagencia.com
**Location:** Peru

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| MCC | Manager Client Center - Google Ads account that manages multiple client accounts |
| GAQL | Google Ads Query Language - SQL-like language for querying Google Ads data |
| CPL | Cost Per Lead - Total cost divided by number of leads |
| CPA | Cost Per Acquisition - Total cost divided by number of conversions |
| ROAS | Return on Ad Spend - Revenue divided by ad spend |

### 11.2 References

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [Google Ads API Terms of Service](https://developers.google.com/google-ads/api/terms)
- [OAuth 2.0 for Server-side Applications](https://developers.google.com/identity/protocols/oauth2)

---

**Document Prepared By:** Reset Development Team
**Last Updated:** February 2026
**Version:** 1.0
