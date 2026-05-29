const fs = require('fs');

let c = fs.readFileSync('src/app/api/jobs/route.ts', 'utf8');

// MAP PAYLOAD
c = c.replace('domainId: job.domain_id', 'domainId: job.domains?.uuid');
c = c.replace('jobTypeId: job.job_type_id', 'jobTypeId: job.job_types?.uuid');
c = c.replace('workplaceTypeId: job.workplace_type_id', 'workplaceTypeId: job.workplace_types?.uuid');
c = c.replace(/locationIds: job\.location_ids \|\| \[\],/g, 'locationIds: job.locationPks || [], // Array format maintained');
c = c.replace(/skillIds: job\.skill_ids \|\| \[\],/g, 'skillIds: job.skillPks || [],');

// JOINS
c = c.replace(/domains\(name\),/g, 'domains(uuid, name),');
c = c.replace(/job_types\(name\),/g, 'job_types(uuid, name),');
c = c.replace(/workplace_types\(name\),/g, 'workplace_types(uuid, name),');

// GET Lookups
const resolveLookups = `
    const domainIdParam = searchParams.get('domain');
    let domainPk = null;
    if (domainIdParam) {
        const { data: d } = await supabaseAdmin.from('domains').select('id').eq('uuid', domainIdParam).single();
        if (d) domainPk = d.id;
    }
`;
c = c.replace("const domainId = searchParams.get('domain');", resolveLookups);
c = c.replace(/domain_id', domainId/g, "domain_pk', domainPk");

c = c.replace("const recruiterId = searchParams.get('recruiterId');", `
    const recruiterId = searchParams.get('recruiterId');
    let recruiterPk = null;
    if (recruiterId) {
        const { data: r } = await supabaseAdmin.from('recruiters').select('id').eq('uuid', recruiterId).single();
        if (r) recruiterPk = r.id;
    }
`);
c = c.replace(/query\.eq\('recruiter_id', recruiterId\)/g, "query.eq('recruiter_pk', recruiterPk)");

c = c.replace("const employeeId = searchParams.get('employeeId');", `
    const employeeId = searchParams.get('employeeId');
    let employeePk = null;
    if (employeeId) {
        const { data: e } = await supabaseAdmin.from('employees').select('id').eq('uuid', employeeId).single();
        if (e) employeePk = e.id;
    }
`);
c = c.replace(/query\.eq\('employee_id', employeeId\)/g, "query.eq('employee_pk', employeePk)");

c = c.replace(/query\.overlaps\('location_ids', locationsParams\)/g, `
    const { data: lpks } = await supabaseAdmin.from('locations').select('id').in('uuid', locationsParams);
    if(lpks) query = query.overlaps('location_pks', lpks.map(l => l.id));
`);

c = c.replace(/query\.in\('domain_id', domainsParams\)/g, `
    const { data: dpks } = await supabaseAdmin.from('domains').select('id').in('uuid', domainsParams);
    if(dpks) query = query.in('domain_pk', dpks.map(d => d.id));
`);

c = c.replace(/query\.in\('job_type_id', jobTypesParams\)/g, `
    const { data: jtpks } = await supabaseAdmin.from('job_types').select('id').in('uuid', jobTypesParams);
    if(jtpks) query = query.in('job_type_pk', jtpks.map(j => j.id));
`);

fs.writeFileSync('src/app/api/jobs/route.ts', c);
console.log('Fixed api/jobs/route.ts');
