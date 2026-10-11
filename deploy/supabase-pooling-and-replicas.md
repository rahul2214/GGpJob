# Supabase Connection Pooling (Port 6543) & Read Replicas Setup Guide

This guide explains how to configure Supabase Connection Pooling, Read Replicas, and Upstash Redis to support **50,000 concurrent users**.

---

## 1. Supabase Connection Pooling (Port 6543 - Transaction Mode)

### Why this is critical:
* Direct PostgreSQL connections (Port `5432` Session Mode) allocate dedicated server process memory per client connection.
* Default PostgreSQL `max_connections` is between 60 and 200.
* **Port 6543 (Transaction Mode with Supavisor / PgBouncer)** allows **10,000+ client connections** to share a pool of 50-100 database connections because connections are returned to the pool immediately after each SQL query finishes.

### How to configure:
1. Log in to your **Supabase Dashboard**.
2. Go to **Project Settings** > **Database**.
3. Scroll down to the **Connection Pooling** section.
4. Ensure:
   * **Pool Mode**: `Transaction`
   * **Port**: `6543`
5. Copy the pooled connection string and update your production environment:
   ```env
   # Replace port 5432 with 6543 in your database connection string
   DATABASE_URL=postgres://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## 2. Read Replicas (Separating Reads from Writes)

### Why this is critical:
* In a job portal, 95% of traffic is **READS** (searching jobs, filtering locations, viewing company profiles, checking blogs).
* Only 5% of traffic is **WRITES** (submitting applications, posting jobs, payment checkouts).
* Routing reads to a Read Replica ensures that 50,000 visitors searching jobs never slow down payments or application submissions.

### How to configure:
1. In Supabase Dashboard, go to **Settings** > **Infrastructure**.
2. Click **Add Read Replica** (choose a region close to your primary audience).
3. Copy the replica URL and set the environment variable:
   ```env
   SUPABASE_READ_REPLICA_URL=https://[YOUR-REPLICA-REF].supabase.co
   ```
4. The application code in `src/lib/supabase-admin.ts` (`supabaseAdminRead`) automatically routes job searches and public queries to this replica. If omitted, it safely falls back to the primary database.

---

## 3. Distributed Upstash Redis Setup (L2 Caching)

### Why this is critical:
* When running multiple autoscale container instances or serverless functions, in-memory cache is isolated to each server.
* Upstash Redis provides an ultra-low latency (<2ms) distributed cache layer shared across all instances.

### How to configure:
1. Go to [Upstash Console](https://console.upstash.com) and create a Redis database.
2. In the database details, copy the **REST API** credentials.
3. Add them to your `.env`:
   ```env
   UPSTASH_REDIS_REST_URL=https://[YOUR-DATABASE].upstash.io
   UPSTASH_REDIS_REST_TOKEN=[YOUR-REST-TOKEN]
   ```
4. The application code in `src/lib/cache.ts` automatically detects these credentials and uses Upstash as an L2 distributed cache with local L1 memory fallback.

---

## 4. Run Optimization SQL Indexes
In your Supabase SQL Editor:
1. Open [`scripts/optimization-indexes.sql`](file:///scripts/optimization-indexes.sql).
2. Copy and paste the entire script into the SQL Editor.
3. Click **Run**.
4. This adds composite and GIN full-text search indexes concurrently with zero downtime.
