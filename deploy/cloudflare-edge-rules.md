# Cloudflare CDN & Edge Optimization Guide (50,000 Concurrent Users)

This guide documents the exact configuration to place Cloudflare in front of your domain to absorb **70% to 90% of all traffic** at the edge before it reaches your origin servers.

---

## 1. Cloudflare DNS & Proxy Setup
1. Point your domain's nameservers to Cloudflare.
2. In the **DNS** tab:
   - Ensure the `A` / `CNAME` records for your domain (e.g., `jobsdart.com` and `www.jobsdart.com`) have **Proxy status: Proxied (Orange Cloud ON)**.
3. Under **SSL/TLS**:
   - Set encryption mode to **Full (Strict)**.
   - Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

---

## 2. Edge Cache Rules (Rules > Cache Rules)
Create the following Cache Rules in order of priority:

### Rule 1: Static Next.js Bundles (High Priority)
* **When incoming requests match:**
  ```text
  (http.request.uri.path starts_with "/_next/static/") or (http.request.uri.path starts_with "/static/")
  ```
* **Cache Eligibility:** Eligible for cache
* **Edge Cache TTL:** Override origin -> **1 month**
* **Browser Cache TTL:** Override origin -> **1 year**

### Rule 2: Next.js Optimized Images
* **When incoming requests match:**
  ```text
  (http.request.uri.path starts_with "/_next/image")
  ```
* **Cache Eligibility:** Eligible for cache
* **Edge Cache TTL:** Override origin -> **7 days**

### Rule 3: Public Reference API Endpoints
* **When incoming requests match:**
  ```text
  (http.request.method eq "GET" and (
    http.request.uri.path starts_with "/api/skills" or 
    http.request.uri.path starts_with "/api/benefits" or 
    http.request.uri.path starts_with "/api/job-types" or 
    http.request.uri.path starts_with "/api/workplace-types" or 
    http.request.uri.path starts_with "/api/company-sizes" or 
    http.request.uri.path starts_with "/api/geo"
  ))
  ```
* **Cache Eligibility:** Eligible for cache
* **Edge Cache TTL:** Override origin -> **1 hour**

### Rule 4: Bypass Cache on Sensitive & Private Routes
* **When incoming requests match:**
  ```text
  (http.request.uri.path starts_with "/api/auth/" or 
   http.request.uri.path starts_with "/api/payments/" or 
   http.request.uri.path starts_with "/api/account/" or 
   http.request.uri.path starts_with "/api/resume/" or 
   http.request.uri.path starts_with "/api/applications/" or 
   http.request.method ne "GET")
  ```
* **Cache Eligibility:** **Bypass cache**

---

## 3. Speed & Compression Optimizations (Speed > Optimization)
* Enable **Brotli** compression (reduces payload by ~25% compared to Gzip).
* Enable **Early Hints** (starts preloading critical CSS and fonts before full HTML response).
* Enable **HTTP/3 (with QUIC)** for lower mobile latency.

---

## 4. Bot & DDoS Protection (Security > Bots & WAF)
* Enable **Bot Fight Mode** to challenge automated scrapers.
* Enable **Security Level: Medium**.
* In **WAF > Rate Limiting Rules**, add:
  * Path `/api/auth/signup` -> 5 requests per 15 minutes per IP.
  * Path `/api/ai/*` -> 10 requests per 1 minute per IP.
