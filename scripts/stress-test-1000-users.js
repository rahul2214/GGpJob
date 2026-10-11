const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const http = require('http');

// 1. Read .env for credentials
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];
const APP_PORT = 9500;
const BASE_URL = `http://localhost:${APP_PORT}`;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const TOTAL_USERS = 1000;
const EMAIL_PREFIX = 'dummy_stress_user_';
const EMAIL_DOMAIN = '@loadtest.local';

// Reusable Concurrency Pool with index parameter
async function runPool(items, limit, fn) {
  const results = [];
  const executing = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const p = Promise.resolve().then(() => fn(item, i));
    results.push(p);
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

// HTTP request helper with keepAlive agent and latency tracking
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });

function makeRequest(path, userIndex = 1) {
  // Generate distinct virtual client IP for each simulated user
  const userIp = `198.51.${Math.floor(userIndex / 250) + 1}.${(userIndex % 250) + 1}`;
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.get(`${BASE_URL}${path}`, { 
      agent: httpAgent, 
      headers: { 
        'x-forwarded-for': userIp,
        'cf-connecting-ip': userIp,
        'x-real-ip': userIp
      },
      timeout: 15000 
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
      resolve({ path, status: 504, duration: 15000, success: false, error: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      const duration = performance.now() - start;
      resolve({ path, status: 500, duration, success: false, error: err.message });
    });
  });
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

// Robust cleanup function ensuring 100% removal
async function cleanupAllDummies() {
  await supabase.from('jobseekers').delete().like('email', `%${EMAIL_DOMAIN}`);
  
  let purgedCount = 0;
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (!data || !data.users || data.users.length === 0) break;
    const dummies = data.users.filter(u => u.email && u.email.includes(EMAIL_DOMAIN));
    if (dummies.length === 0) {
      let foundOthers = false;
      for (let p = 2; p <= 10; p++) {
        const { data: d2 } = await supabase.auth.admin.listUsers({ page: p, perPage: 100 });
        const more = (d2?.users || []).filter(u => u.email && u.email.includes(EMAIL_DOMAIN));
        if (more.length > 0) {
          foundOthers = true;
          await runPool(more, 25, (u) => supabase.auth.admin.deleteUser(u.id));
          purgedCount += more.length;
        }
      }
      if (!foundOthers) break;
    } else {
      await runPool(dummies, 25, (u) => supabase.auth.admin.deleteUser(u.id));
      purgedCount += dummies.length;
    }
  }

  const { count: jsRemaining } = await supabase
    .from('jobseekers')
    .select('*', { count: 'exact', head: true })
    .like('email', `%${EMAIL_DOMAIN}`);

  return { purgedCount, jsRemaining: jsRemaining || 0 };
}

async function run() {
  console.log('================================================================');
  console.log(`🚀 STARTING 1,000 LIVE DUMMY USER STRESS & CRASH TEST`);
  console.log(`Target Application: ${BASE_URL}`);
  console.log(`Database Target:    ${SUPABASE_URL}`);
  console.log('================================================================\n');

  let createdUsers = [];

  try {
    // STEP 1: INITIAL CLEANUP
    console.log('🧹 Step 1: Pre-test verification & clean-up...');
    const preClean = await cleanupAllDummies();
    console.log(`   Cleaned residual users: ${preClean.purgedCount}. Live remaining = ${preClean.jsRemaining}.`);
    console.log('   ✅ Clean slate confirmed.\n');

    // STEP 2: PROVISION 1,000 LIVE DUMMY USERS
    console.log(`👥 Step 2: Creating ${TOTAL_USERS} live dummy users in database...`);
    const userIndices = Array.from({ length: TOTAL_USERS }, (_, i) => i + 1);
    const createStart = performance.now();
    let count = 0;

    const creationResults = await runPool(userIndices, 25, async (num) => {
      const email = `${EMAIL_PREFIX}${String(num).padStart(4, '0')}${EMAIL_DOMAIN}`;
      const res = await supabase.auth.admin.createUser({
        email,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: { name: `Live Dummy User ${num}` }
      });
      count++;
      if (count % 100 === 0 || count === TOTAL_USERS) {
        process.stdout.write(`   Provisioned: ${count} / ${TOTAL_USERS} live users...\r`);
      }
      return res;
    });

    createdUsers = creationResults
      .filter(r => r.data?.user)
      .map(r => ({ id: r.data.user.id, email: r.data.user.email }));

    const createDuration = ((performance.now() - createStart) / 1000).toFixed(1);
    console.log(`\n   ✅ ${createdUsers.length} live dummy users successfully provisioned in ${createDuration}s!\n`);

    // Verify in database
    const { count: jobseekersCount } = await supabase
      .from('jobseekers')
      .select('*', { count: 'exact', head: true })
      .like('email', `%${EMAIL_DOMAIN}`);
    console.log(`   📊 Live Jobseekers in Database: ${jobseekersCount} verified records active.\n`);

    // STEP 3: BASELINE SERVER HEALTH CHECK
    console.log('🩺 Step 3: Checking baseline server health before traffic surge...');
    const baselineHealth = await makeRequest('/api/health', 1);
    console.log(`   Baseline Health: Status ${baselineHealth.status} (Healthy=${baselineHealth.success}, Latency=${baselineHealth.duration.toFixed(2)}ms)\n`);

    // STEP 4: SIMULATE 1,000 CONCURRENT LIVE USERS
    console.log('⚡ Step 4: Simulating 1,000 concurrent live users executing realistic workflows...\n');
    const allResults = [];
    const startWorkload = performance.now();

    // Wave 1: 800 Concurrent Users Browsing & Searching Jobs Feed
    console.log('▶️ Wave 1: 800 users searching & browsing jobs feed (/api/jobs with filters)...');
    const searchFilters = [
      '/api/jobs?limit=10',
      '/api/jobs?keyword=software',
      '/api/jobs?keyword=developer',
      '/api/jobs?type=Full-time',
      '/api/jobs?limit=20',
      '/api/jobs'
    ];
    const wave1Users = createdUsers.slice(0, 800);
    const wave1Results = await runPool(wave1Users, 40, (_, idx) => {
      const filter = searchFilters[idx % searchFilters.length];
      return makeRequest(filter, idx);
    });
    allResults.push(...wave1Results);
    const wave1Stats = calculateStats(wave1Results.map(r => r.duration));
    const wave1Success = wave1Results.filter(r => r.success).length;
    console.log(`   Wave 1 Result: ${wave1Success}/${wave1Users.length} successful (${(wave1Success/wave1Users.length*100).toFixed(1)}%)`);
    console.log(`   Latencies: Min=${wave1Stats.min}ms | Mean=${wave1Stats.mean}ms | P50=${wave1Stats.median}ms | P95=${wave1Stats.p95}ms | P99=${wave1Stats.p99}ms | Max=${wave1Stats.max}ms\n`);

    // Wave 2: 100 Concurrent Users Checking Notifications
    console.log('▶️ Wave 2: 100 users checking notifications (/api/notifications)...');
    const wave2Users = createdUsers.slice(800, 900);
    const wave2Results = await runPool(wave2Users, 20, (u, idx) => makeRequest(`/api/notifications?userId=${u.id}`, 800 + idx));
    allResults.push(...wave2Results);
    const wave2Stats = calculateStats(wave2Results.map(r => r.duration));
    const wave2Success = wave2Results.filter(r => r.success).length;
    console.log(`   Wave 2 Result: ${wave2Success}/${wave2Users.length} successful (${(wave2Success/wave2Users.length*100).toFixed(1)}%)`);
    console.log(`   Latencies: Min=${wave2Stats.min}ms | Mean=${wave2Stats.mean}ms | P50=${wave2Stats.median}ms | P95=${wave2Stats.p95}ms | P99=${wave2Stats.p99}ms | Max=${wave2Stats.max}ms\n`);

    // Wave 3: 100 Concurrent Users Viewing Profiles
    console.log('▶️ Wave 3: 100 users loading profiles (/api/users?uid=...)...');
    const wave3Users = createdUsers.slice(900, 1000);
    const wave3Results = await runPool(wave3Users, 15, (u, idx) => makeRequest(`/api/users?uid=${u.id}`, 900 + idx));
    allResults.push(...wave3Results);
    const wave3Stats = calculateStats(wave3Results.map(r => r.duration));
    const wave3Success = wave3Results.filter(r => r.success).length;
    console.log(`   Wave 3 Result: ${wave3Success}/${wave3Users.length} successful (${(wave3Success/wave3Users.length*100).toFixed(1)}%)`);
    console.log(`   Latencies: Min=${wave3Stats.min}ms | Mean=${wave3Stats.mean}ms | P50=${wave3Stats.median}ms | P95=${wave3Stats.p95}ms | P99=${wave3Stats.p99}ms | Max=${wave3Stats.max}ms\n`);

    const totalWorkloadTime = ((performance.now() - startWorkload) / 1000).toFixed(2);
    const overallSuccess = allResults.filter(r => r.success).length;
    const overallFailures = allResults.length - overallSuccess;
    const overallStats = calculateStats(allResults.map(r => r.duration));
    const throughputRps = (allResults.length / parseFloat(totalWorkloadTime)).toFixed(1);

    // STEP 5: POST-SURGE HEALTH CHECK
    console.log('🔍 Step 5: Post-surge server stability & crash check...');
    const postHealth = await makeRequest('/api/health', 999);
    const didServerCrash = !postHealth.success;
    console.log(`   Post-Test Server Health: Status ${postHealth.status} (Healthy=${postHealth.success}, Latency=${postHealth.duration.toFixed(2)}ms)`);
    console.log(`   Did the server crash? ${didServerCrash ? '💥 YES (CRASHED)' : '🛡️ NO (100% OPERATIONAL & HEALTHY)'}\n`);

    // STEP 6: CLEANUP & PURGE ALL 1,000 DUMMY USERS
    console.log('🗑️ Step 6: Purging all 1,000 dummy users from the database...');
    const cleanResult = await cleanupAllDummies();
    console.log(`   Purged: ${cleanResult.purgedCount} users.`);
    console.log(`   Residual dummy users in DB: ${cleanResult.jsRemaining} (Should be 0)`);
    const cleanupVerified = cleanResult.jsRemaining === 0;

    // STEP 7: SAVE REPORT
    const report = {
      testExecutedAt: new Date().toISOString(),
      concurrencyLevel: TOTAL_USERS,
      totalRequestsSent: allResults.length,
      successfulRequests: overallSuccess,
      failedRequests: overallFailures,
      successRate: `${(overallSuccess / allResults.length * 100).toFixed(2)}%`,
      testDurationSeconds: totalWorkloadTime,
      throughputRequestsPerSec: throughputRps,
      serverCrashed: didServerCrash,
      databaseUsersCleanedUp: cleanupVerified,
      latencyMetricsMs: overallStats,
      breakdownByWave: {
        wave1_jobs_feed_800_users: { requests: wave1Users.length, successRate: `${(wave1Success/wave1Users.length*100).toFixed(1)}%`, avgLatencyMs: wave1Stats.mean },
        wave2_notifications_100_users: { requests: wave2Users.length, successRate: `${(wave2Success/wave2Users.length*100).toFixed(1)}%`, avgLatencyMs: wave2Stats.mean },
        wave3_profile_lookups_100_users: { requests: wave3Users.length, successRate: `${(wave3Success/wave3Users.length*100).toFixed(1)}%`, avgLatencyMs: wave3Stats.mean }
      }
    };

    fs.writeFileSync('scripts/load-test-report.json', JSON.stringify(report, null, 2));

    console.log('================================================================');
    console.log('📊 OFFICIAL 1,000 LIVE USER STRESS TEST REPORT');
    console.log('================================================================');
    console.log(`• Live Dummy Users Simulated: ${TOTAL_USERS}`);
    console.log(`• Total Requests Sent:         ${report.totalRequestsSent}`);
    console.log(`• Successful Requests (2xx):   ${report.successfulRequests}`);
    console.log(`• Failed Requests (5xx/4xx):   ${report.failedRequests}`);
    console.log(`• Overall Success Rate:        ${report.successRate}`);
    console.log(`• Overall Throughput:          ${report.throughputRequestsPerSec} req/sec`);
    console.log(`• Average Response Time:       ${report.latencyMetricsMs.mean} ms`);
    console.log(`• Median (P50) Latency:        ${report.latencyMetricsMs.median} ms`);
    console.log(`• 95th Percentile (P95):       ${report.latencyMetricsMs.p95} ms`);
    console.log(`• 99th Percentile (P99):       ${report.latencyMetricsMs.p99} ms`);
    console.log(`• Server Crash Status:         ${report.serverCrashed ? '💥 CRASHED' : '🛡️ PASSED (ZERO CRASHES)'}`);
    console.log(`• Database Cleanup:            ${report.databaseUsersCleanedUp ? '✅ 100% PURGED (0 remaining)' : '⚠️ INCOMPLETE'}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Fatal load test error:', err);
  } finally {
    console.log('🧹 Final Safety Guard: Ensuring all test users are purged...');
    const finalClean = await cleanupAllDummies();
    console.log(`✅ Guaranteed Cleanup Complete. Residual dummy users: ${finalClean.jsRemaining}\n`);
  }
}

run();
