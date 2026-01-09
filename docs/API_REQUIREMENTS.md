# API Requirements - UCSP Algorithm MVP

## Overview

This document lists ALL API accesses required to fully operationalize the UCSP Algorithm platform.

---

## Currently Integrated (via Apify)

### 1. Google Trends API
- **Status**: Active
- **Method**: Apify actor `trudax/google-trends-scraper`
- **Authentication**: Apify API Token
- **Data Retrieved**:
  - Keyword interest over time (0-100)
  - Regional interest breakdown
  - Related queries
  - Trend direction (rising/stable)
- **Refresh Frequency**: Weekly (Monday 8 AM Peru)
- **Cost**: Apify compute units (~$0.50/run)

### 2. TikTok Creative Center
- **Status**: Active
- **Method**: Apify actor `clockworks/tiktok-trends-scraper`
- **Authentication**: Apify API Token
- **Data Retrieved**:
  - Trending hashtags (LATAM via Brazil proxy)
  - Trending sounds (Global)
  - Views, posts, growth metrics
  - Industry categorization
- **Refresh Frequency**: Weekly
- **Cost**: Apify compute units (~$0.30/run)
- **Note**: Peru not directly supported, using Brazil for LATAM proxy

### 3. Meta/Facebook Social Listening
- **Status**: Active (Custom Actor)
- **Method**: Custom Apify actor `globular_cinema/my-actor`
- **Authentication**: Apify API Token
- **Data Retrieved**:
  - Page engagement metrics (UCSP, competitors)
  - Trending topics in education sector
  - Sentiment analysis
  - Brand mentions
- **Refresh Frequency**: Weekly
- **Cost**: Apify compute units (~$0.40/run)

---

## Required API Integrations (Pending)

### 4. Google Analytics 4 (GA4) API

**Purpose**: Website traffic, user behavior, conversion tracking

**Required Scopes**:
```
https://www.googleapis.com/auth/analytics.readonly
```

**Data to Retrieve**:
- Total users, sessions, page views
- Conversion events (form submissions, lead generation)
- Traffic sources (organic, paid, social, direct)
- Top landing pages with conversion rates
- User demographics and geography
- Site search terms
- Session duration, bounce rate, exit rate

**Authentication Method**:
- OAuth 2.0 Service Account
- JSON key file required

**Setup Steps**:
1. Create Google Cloud project
2. Enable Analytics Data API
3. Create service account with Viewer role
4. Download JSON key file
5. Add service account email to GA4 property as Viewer
6. Configure `.env` with credentials path

**Required Secrets**:
```env
GA4_PROPERTY_ID=123456789
GA4_CREDENTIALS_PATH=./secrets/ga4-service-account.json
```

**API Endpoints Used**:
- `runReport` - Main data retrieval
- `batchRunReports` - Multiple queries at once

**Rate Limits**:
- 10 requests per second per project
- 10,000 requests per day per project

---

### 5. Google Ads API

**Purpose**: Campaign performance, ad spend, keyword metrics

**Required Access Level**:
- Standard Access (apply via Google Ads API Center)

**Required Scopes**:
```
https://www.googleapis.com/auth/adwords
```

**Data to Retrieve**:
- Campaign spend by channel
- Cost per lead (CPL) by campaign
- Impressions, clicks, CTR
- Conversion metrics
- Keyword performance
- Quality scores
- Ad group performance
- Search terms report

**Authentication Method**:
- OAuth 2.0 with refresh token
- Developer token required

**Setup Steps**:
1. Apply for Google Ads API access (may take 2-4 weeks)
2. Create OAuth credentials in Google Cloud Console
3. Get developer token from Google Ads account
4. Generate refresh token via OAuth flow
5. Configure client customer ID

**Required Secrets**:
```env
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx
GOOGLE_ADS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxxxx
GOOGLE_ADS_REFRESH_TOKEN=xxxxx
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=123-456-7890
```

**API Endpoints Used**:
- GoogleAdsService.Search - Query builder for metrics
- CustomerService - Account info
- ReportService - Report generation

**Rate Limits**:
- 1,000 requests per day (basic)
- 15,000 requests per day (standard)

---

### 6. Meta Marketing API (Facebook/Instagram Ads)

**Purpose**: Ad campaign performance, audience insights, spend tracking

**Required Permissions**:
- `ads_read` - Read campaign data
- `ads_management` - Full campaign access (optional)
- `business_management` - Business account access
- `read_insights` - Performance metrics

**Data to Retrieve**:
- Campaign spend and budget
- Impressions, reach, frequency
- CPL, CPC, CPM metrics
- Conversion events (Lead, Purchase)
- Audience demographics
- Ad creative performance
- WhatsApp conversation metrics (if using Click-to-WhatsApp)

**Authentication Method**:
- System User Access Token (recommended for server-to-server)
- Long-lived token (60 days, auto-refresh)

**Setup Steps**:
1. Create Meta Business App at developers.facebook.com
2. Add Marketing API product
3. Create System User in Business Manager
4. Generate System User Access Token with required permissions
5. Get Ad Account ID from Business Manager

**Required Secrets**:
```env
META_ACCESS_TOKEN=EAAxxxxx
META_AD_ACCOUNT_ID=act_123456789
META_BUSINESS_ID=123456789
META_APP_ID=xxxxx
META_APP_SECRET=xxxxx
```

**API Endpoints Used**:
- `/act_{ad_account_id}/insights` - Performance metrics
- `/act_{ad_account_id}/campaigns` - Campaign list
- `/act_{ad_account_id}/adsets` - Ad set data
- `/{ad_id}/insights` - Ad-level metrics

**Rate Limits**:
- Tier depends on app review status
- Generally 200-300 calls per hour per user

---

### 7. HubSpot CRM API

**Purpose**: Lead tracking, CPL monitoring, sales pipeline integration

**Required Scopes**:
- `crm.objects.contacts.read` - Read contacts
- `crm.objects.deals.read` - Read deals/opportunities
- `crm.lists.read` - Read contact lists
- `automation` - Workflow access (optional)

**Data to Retrieve**:
- New leads (contact creation)
- Lead source attribution
- Lead status/stage
- Deal pipeline stages
- Conversion timestamps
- Lead quality scores
- Custom properties (program interest, carrera)

**Authentication Method**:
- Private App Token (recommended)
- OAuth 2.0 (alternative)

**Setup Steps**:
1. Create Private App in HubSpot Settings > Integrations
2. Select required scopes
3. Copy access token
4. Store securely in environment

**Required Secrets**:
```env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxx
HUBSPOT_PORTAL_ID=123456
```

**API Endpoints Used**:
- `/crm/v3/objects/contacts` - Contact CRUD
- `/crm/v3/objects/deals` - Deal CRUD
- `/crm/v3/objects/contacts/search` - Search contacts
- `/analytics/v2/reports` - Analytics data

**Rate Limits**:
- 100 requests per 10 seconds (Private Apps)
- 500,000 requests per day

---

## Optional/Future Integrations

### 8. Meta Ads Library API
**Purpose**: Competitor ad monitoring
**Status**: Optional enhancement
**Note**: Can be added via Apify actor `apify/facebook-ads-scraper`

### 9. LinkedIn Marketing API
**Purpose**: B2B lead generation for Posgrado
**Status**: Future consideration
**Complexity**: High (requires partner status)

### 10. WhatsApp Business API
**Purpose**: Direct message tracking, chatbot integration
**Status**: Future consideration
**Note**: Requires Business Solution Provider

---

## Summary: Required Access Credentials

| Service | Auth Type | Priority | Timeline |
|---------|-----------|----------|----------|
| GA4 | Service Account JSON | HIGH | 1-2 days |
| Google Ads | OAuth + Dev Token | HIGH | 2-4 weeks (approval) |
| Meta Ads | System User Token | HIGH | 1-3 days |
| HubSpot | Private App Token | MEDIUM | Same day |

---

## Implementation Order

1. **Phase 1 (Week 1)**
   - GA4 API integration
   - Replace mock data in DataLayer.jsx

2. **Phase 2 (Week 2-3)**
   - Meta Marketing API integration
   - Real campaign spend data

3. **Phase 3 (Week 4-6)**
   - Google Ads API (pending approval)
   - Full budget tracking

4. **Phase 4 (Week 6+)**
   - HubSpot CRM integration
   - Automated CPL monitoring

---

## Data Flow Architecture

```
                    +------------------+
                    |   GitHub Actions |
                    |   (Weekly Cron)  |
                    +--------+---------+
                             |
         +-------------------+-------------------+
         |                   |                   |
    +----v----+        +-----v-----+       +-----v-----+
    |  Apify  |        |   APIs    |       |  ML       |
    | Scrapers|        | (GA4,Ads, |       | Pipeline  |
    |         |        |  HubSpot) |       |           |
    +----+----+        +-----+-----+       +-----+-----+
         |                   |                   |
         +-------------------+-------------------+
                             |
                    +--------v---------+
                    |   public/data/   |
                    | (JSON artifacts) |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  React Frontend  |
                    |   (DataLayer)    |
                    +------------------+
```

---

## Contact Information Needed

To proceed with API integrations, please provide:

1. **GA4**: Property ID and permission to add service account
2. **Google Ads**: Manager account access for API application
3. **Meta Ads**: Business Manager admin access for app creation
4. **HubSpot**: Admin access to create Private App

---

*Document created: 2026-01-09*
*Last updated: 2026-01-09*
