const fs = require('fs');
let c = fs.readFileSync('src/app/api/jobs/[id]/route.ts', 'utf8');

// mapJobDetailToFrontend
c = c.replace(/in\('id', job.location_ids \|\| \[\]\)/g, "in('id', job.location_pks || [])");
c = c.replace(/in\('id', job.skill_ids \|\| \[\]\)/g, "in('id', job.skill_pks || [])");
c = c.replace(/domainId: job\.domain_id/g, "domainId: job.domains?.uuid");
c = c.replace(/jobTypeId: job\.job_type_id/g, "jobTypeId: job.job_types?.uuid");
c = c.replace(/workplaceTypeId: job\.workplace_type_id/g, "workplaceTypeId: job.workplace_types?.uuid");
c = c.replace(/locationIds: job\.location_ids \|\| \[\]/g, "locationIds: job.location_pks || []"); // we return array format
c = c.replace(/skillIds: job\.skill_ids \|\| \[\]/g, "skillIds: job.skill_pks || []");

// GET joins
c = c.replace(/domains\(name\),/g, 'domains(uuid, name),');
c = c.replace(/job_types\(name\),/g, 'job_types(uuid, name),');
c = c.replace(/workplace_types\(name\),/g, 'workplace_types(uuid, name),');

// PUT
const putLookups = `
        // RESOLVE PKs for PUT
        let domainPk = null, jobTypePk = null, workplaceTypePk = null;
        if(body.domainId) { const d = await supabaseAdmin.from('domains').select('id').eq('uuid', body.domainId).single(); if(d.data) domainPk = d.data.id; }
        if(body.jobTypeId) { const j = await supabaseAdmin.from('job_types').select('id').eq('uuid', body.jobTypeId).single(); if(j.data) jobTypePk = j.data.id; }
        if(body.workplaceTypeId) { const w = await supabaseAdmin.from('workplace_types').select('id').eq('uuid', body.workplaceTypeId).single(); if(w.data) workplaceTypePk = w.data.id; }
        
        let locationPks = body.locationIds ? await (async () => { const l = await supabaseAdmin.from('locations').select('id').in('uuid', body.locationIds); return l.data ? l.data.map(x=>x.id) : []; })() : [];
        let skillPks = body.skillIds ? await (async () => { const s = await supabaseAdmin.from('skills').select('id').in('uuid', body.skillIds); return s.data ? s.data.map(x=>x.id) : []; })() : [];

        // Map camelCase to snake_case for DB
`;
c = c.replace('        // Map camelCase to snake_case for DB', putLookups);

c = c.replace(/domain_id: body\.domainId,/g, 'domain_pk: domainPk,');
c = c.replace(/job_type_id: body\.jobTypeId,/g, 'job_type_pk: jobTypePk,');
c = c.replace(/workplace_type_id: body\.workplaceTypeId,/g, 'workplace_type_pk: workplaceTypePk,');
c = c.replace(/location_ids: body\.locationIds,/g, 'location_pks: locationPks,');
c = c.replace(/skill_ids: body\.skillIds \|\| \[\],/g, 'skill_pks: skillPks,');

fs.writeFileSync('src/app/api/jobs/[id]/route.ts', c);
