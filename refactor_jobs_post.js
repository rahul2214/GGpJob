const fs = require('fs');
let c = fs.readFileSync('src/app/api/jobs/route.ts', 'utf8');

const lookups = `
    // RESOLVE PKs
    let domainPk = null, jobTypePk = null, workplaceTypePk = null;
    if(data.domainId) { const d = await supabaseAdmin.from('domains').select('id').eq('uuid', data.domainId).single(); if(d.data) domainPk = d.data.id; }
    if(data.jobTypeId) { const j = await supabaseAdmin.from('job_types').select('id').eq('uuid', data.jobTypeId).single(); if(j.data) jobTypePk = j.data.id; }
    if(data.workplaceTypeId) { const w = await supabaseAdmin.from('workplace_types').select('id').eq('uuid', data.workplaceTypeId).single(); if(w.data) workplaceTypePk = w.data.id; }
    
    let locationPks = [];
    let locIds = data.locationIds || (data.locationId ? [data.locationId] : []);
    if(locIds.length > 0) { const l = await supabaseAdmin.from('locations').select('id').in('uuid', locIds); if(l.data) locationPks = l.data.map(x=>x.id); }

    let skillPks = [];
    if(data.skillIds && data.skillIds.length > 0) { const s = await supabaseAdmin.from('skills').select('id').in('uuid', data.skillIds); if(s.data) skillPks = s.data.map(x=>x.id); }

    const jobToCreate = {
`;

c = c.replace('    const jobToCreate = {', lookups);

c = c.replace(/domain_id: data\.domainId,/g, 'domain_pk: domainPk,');
c = c.replace(/job_type_id: data\.jobTypeId,/g, 'job_type_pk: jobTypePk,');
c = c.replace(/workplace_type_id: data\.workplaceTypeId,/g, 'workplace_type_pk: workplaceTypePk,');
c = c.replace(/location_ids: data\.locationIds \|\| \(data\.locationId \? \[data\.locationId\] : \[\]\),/g, 'location_pks: locationPks,');
c = c.replace(/skill_ids: data\.skillIds \|\| \[\],/g, 'skill_pks: skillPks,'); // Wait, is skill_ids inserted? Yes, maybe later in the file. Check if skill_ids was there. Actually I'll just regex it or just replace `location_pks: locationPks,` and let's add `skill_pks: skillPks` manually below it.

fs.writeFileSync('src/app/api/jobs/route.ts', c);
