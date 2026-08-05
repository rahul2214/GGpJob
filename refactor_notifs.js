const fs = require('fs');
let c = fs.readFileSync('src/app/api/notifications/route.ts', 'utf8');

c = c.replace(/if \(!userId\) \{\s*return NextResponse.json\(\{ error: 'User ID is required' \}, \{ status: 400 \}\);\s*\}/, `if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Resolve user_pk from userId (UUID)
    const { data: u } = await supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).single();
    if (!u) return NextResponse.json([]);
    const userPk = u.id;`);

c = c.replace(/user_id, \s*user_pk, \s*message, \s*type, \s*job_id, \s*job_pk,/g, 'user_pk, message, type, job_pk,');
c = c.replace(/jobs:job_id \(title\)/g, 'jobs (uuid, title)');

c = c.replace(/\.or\(\`user_id\.eq\.\$\{userId\},user_pk\.eq\.\$\{userId\}\`\)/g, ".eq('user_pk', userPk)");

c = c.replace(/userId: n\.user_id,/g, 'userId: n.user_pk,');
c = c.replace(/jobId: n\.job_id,/g, 'jobId: n.jobs?.uuid,');
c = c.replace(/user_id: userId,\s*\/\/\s*Compatibility UUID\s*/g, '');
c = c.replace(/job_id: jobId \|\| null,\s*\/\/\s*Compatibility UUID\s*/g, '');
c = c.replace(/user_id,/g, '');
c = c.replace(/job_id,/g, '');

fs.writeFileSync('src/app/api/notifications/route.ts', c);
