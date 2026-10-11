const http = require('http');
const fs = require('fs');

const APP_PORT = 9500;
const BASE_URL = `http://localhost:${APP_PORT}`;
const TOTAL_REQUESTS = 5000;
const CONCURRENT_WORKERS = 50; // High-concurrency worker pool

// HTTP Keep-Alive Agent to efficiently reuse sockets without exceeding OS limits
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: CONCURRENT_WORKERS + 10,
  maxFreeSockets: CONCURRENT_WORKERS
});

function makeRequest(path, virtualUserId) {
  // Generate realistic unique virtual client IP for each simulated request
  const ipPart1 = Math.floor(virtualUserId / 250) + 1;
  const ipPart2 = (virtualUserId % 250) + 1;
  const clientIp = `198.51.${ipPart1}.${ipPart2}`;

  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.get(`${BASE_URL}${path}`, {
      agent: httpAgent,
      headers: {
        'x-forwarded-for': clientIp,
        'cf-connecting-ip': clientIp,
        'x-real-ip': clientIp
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = performance.now() - start;
        resolve({
          path,
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ path, status: 504, duration: 10000, success: false, error: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      const duration = performance.now() - start;
      resolve({ path, status: 500, duration, success: false, error: err.message });
    });
  });
}

// Concurrency Pool Runner with progress indicator
async function runPool(items, limit, fn) {
  const results = [];
  const executing = [];
  let completed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const p = Promise.resolve().then(() => fn(item, i));
    results.push(p);

    p.then(() => {
      completed++;
      if (completed % 250 === 0 || completed === items.length) {
        process.stdout.write(`   Progress: ${completed} / ${items.length} requests completed...\r`);
      }
    });

    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

// Calculate latency percentiles
function calculateStats(latencies) {
  if (latencies.length === 0) return { min: '0.00', max: '0.00', mean: '0.00', median: '0.00', p95: '0.00', p99: '0.00' };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return {
    min: sorted[0].toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    p95: p95.toFixed(2),
    p99: p99.toFixed(2)
  };
}

async function run() {
  console.log('================================================================');
  console.log(`🚀 STARTING 5,000 HIGH-THROUGHPUT BURST & CEILING TEST`);
  console.log(`Target Application:   ${BASE_URL}`);
  console.log(`Total Requests:       ${TOTAL_REQUESTS}`);
  console.log(`Concurrency Workers:  ${CONCURRENT_WORKERS}`);
  console.log('================================================================\n');

  // STEP 1: BASELINE HEALTH CHECK
  console.log('🩺 Step 1: Pre-test baseline health check...');
  const baseline = await makeRequest('/api/health', 1);
  console.log(`   Baseline Server Status: ${baseline.status} (Healthy=${baseline.success}, Latency=${baseline.duration.toFixed(2)}ms)\n`);

  // STEP 2: BUILD 5,000 REALISTIC PRODUCTION WORKLOAD REQUESTS
  console.log('📦 Step 2: Building 5,000 realistic production request distribution:');
  console.log('   • 3,000 requests to /api/jobs (Search, Filters, Pagination, Feed)');
  console.log('   • 1,000 requests to reference taxonomy routes (/api/skills, /api/benefits)');
  console.log('   • 1,000 requests to /api/health (Continuous monitoring)');

  const requestsQueue = [];
  const searchEndpoints = [
    '/api/jobs',
    '/api/jobs?limit=10',
    '/api/jobs?limit=20',
    '/api/jobs?keyword=software',
    '/api/jobs?keyword=developer',
    '/api/jobs?type=Full-time'
  ];

  const taxonomyEndpoints = [
    '/api/skills',
    '/api/benefits',
    '/api/job-types',
    '/api/workplace-types'
  ];

  // 1. 3,000 Jobs feed & search requests
  for (let i = 0; i < 3000; i++) {
    const ep = searchEndpoints[i % searchEndpoints.length];
    requestsQueue.push({ type: 'jobs', path: ep });
  }

  // 2. 1,000 Taxonomy requests
  for (let i = 0; i < 1000; i++) {
    const ep = taxonomyEndpoints[i % taxonomyEndpoints.length];
    requestsQueue.push({ type: 'taxonomy', path: ep });
  }

  // 3. 1,000 Health check requests
  for (let i = 0; i < 1000; i++) {
    requestsQueue.push({ type: 'health', path: '/api/health' });
  }

  // Shuffle queue to simulate realistic concurrent interweaving
  for (let i = requestsQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [requestsQueue[i], requestsQueue[j]] = [requestsQueue[j], requestsQueue[i]];
  }

  console.log(`\n⚡ Step 3: Firing 5,000 concurrent requests across ${CONCURRENT_WORKERS} workers...\n`);
  const startBurst = performance.now();

  const burstResults = await runPool(requestsQueue, CONCURRENT_WORKERS, (item, idx) => {
    return makeRequest(item.path, idx);
  });

  const totalTimeSeconds = ((performance.now() - startBurst) / 1000).toFixed(2);
  const successful = burstResults.filter(r => r.success).length;
  const failed = burstResults.length - successful;
  const stats = calculateStats(burstResults.map(r => r.duration));
  const throughputRps = (burstResults.length / parseFloat(totalTimeSeconds)).toFixed(1);

  // STEP 4: POST-SURGE HEALTH & CRASH VERIFICATION
  console.log('\n\n🔍 Step 4: Post-burst server stability & crash check...');
  const postHealth = await makeRequest('/api/health', 99999);
  const didServerCrash = !postHealth.success;
  console.log(`   Post-Burst Server Health: Status ${postHealth.status} (Healthy=${postHealth.success}, Latency=${postHealth.duration.toFixed(2)}ms)`);
  console.log(`   Did the server crash? ${didServerCrash ? '💥 YES (CRASHED)' : '🛡️ NO (100% OPERATIONAL & HEALTHY)'}\n`);

  // STEP 5: BREAKDOWN BY ROUTE TYPE
  const jobsResults = burstResults.filter(r => r.path.startsWith('/api/jobs'));
  const jobsSuccess = jobsResults.filter(r => r.success).length;
  const jobsStats = calculateStats(jobsResults.map(r => r.duration));

  const taxResults = burstResults.filter(r => r.path.startsWith('/api/skills') || r.path.startsWith('/api/benefits') || r.path.startsWith('/api/job-types') || r.path.startsWith('/api/workplace-types'));
  const taxSuccess = taxResults.filter(r => r.success).length;
  const taxStats = calculateStats(taxResults.map(r => r.duration));

  const healthResults = burstResults.filter(r => r.path === '/api/health');
  const healthSuccess = healthResults.filter(r => r.success).length;
  const healthStats = calculateStats(healthResults.map(r => r.duration));

  const report = {
    testExecutedAt: new Date().toISOString(),
    totalRequestsSent: TOTAL_REQUESTS,
    concurrentWorkers: CONCURRENT_WORKERS,
    successfulRequests: successful,
    failedRequests: failed,
    successRate: `${(successful / TOTAL_REQUESTS * 100).toFixed(2)}%`,
    testDurationSeconds: totalTimeSeconds,
    throughputRequestsPerSec: throughputRps,
    serverCrashed: didServerCrash,
    latencyMetricsMs: stats,
    breakdown: {
      jobs_api_3000_reqs: { count: jobsResults.length, successRate: `${(jobsSuccess / jobsResults.length * 100).toFixed(1)}%`, avgLatencyMs: jobsStats.mean, p95Ms: jobsStats.p95 },
      taxonomy_api_1000_reqs: { count: taxResults.length, successRate: `${(taxSuccess / taxResults.length * 100).toFixed(1)}%`, avgLatencyMs: taxStats.mean, p95Ms: taxStats.p95 },
      health_api_1000_reqs: { count: healthResults.length, successRate: `${(healthSuccess / healthResults.length * 100).toFixed(1)}%`, avgLatencyMs: healthStats.mean, p95Ms: healthStats.p95 }
    }
  };

  fs.writeFileSync('scripts/burst-test-5000-report.json', JSON.stringify(report, null, 2));

  console.log('================================================================');
  console.log('📊 OFFICIAL 5,000-REQUEST BURST & CEILING TEST REPORT');
  console.log('================================================================');
  console.log(`• Total Requests Sent:         ${report.totalRequestsSent}`);
  console.log(`• Successful Requests (2xx):   ${report.successfulRequests}`);
  console.log(`• Failed Requests (5xx/4xx):   ${report.failedRequests}`);
  console.log(`• Overall Success Rate:        ${report.successRate}`);
  console.log(`• Total Burst Duration:        ${report.testDurationSeconds} seconds`);
  console.log(`• Max Sustained Throughput:    ${report.throughputRequestsPerSec} req/sec`);
  console.log(`• Average Response Time:       ${report.latencyMetricsMs.mean} ms`);
  console.log(`• Median (P50) Latency:        ${report.latencyMetricsMs.median} ms`);
  console.log(`• 95th Percentile (P95):       ${report.latencyMetricsMs.p95} ms`);
  console.log(`• 99th Percentile (P99):       ${report.latencyMetricsMs.p99} ms`);
  console.log(`• Server Crash Status:         ${report.serverCrashed ? '💥 CRASHED' : '🛡️ PASSED (ZERO CRASHES)'}`);
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('Fatal burst test error:', err);
  process.exit(1);
});
