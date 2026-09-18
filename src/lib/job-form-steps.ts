/**
 * The steps the job posting form is split across.
 *
 * `fields` drives three things: which inputs a step validates before it lets
 * you move on, which step to jump to when a submit turns up an error, and
 * whether a step is marked complete. Every field the schema can reject belongs
 * to exactly one step, so nothing can fail on a step you cannot reach.
 *
 * Order matters: Workplace Type sits in the first step because the Location
 * step's "open to all countries" toggle is only offered for a remote role.
 */
export const JOB_FORM_STEPS = [
  {
    id: 'role',
    title: 'Role',
    description: 'The job itself — title, type and experience.',
    fields: ['jobTitle', 'jobId', 'jobTypeId', 'workplaceTypeId', 'minExperience', 'maxExperience', 'vacancies'],
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Who is hiring, and where candidates will find you.',
    fields: ['companyName', 'companyWebsite', 'companyLinkedinUrl', 'companySizeId', 'companyOverview', 'address'],
  },
  {
    id: 'location',
    title: 'Location',
    description: 'The countries you are hiring in.',
    fields: ['openToAllCountries', 'locations'],
  },
  {
    id: 'details',
    title: 'Details',
    description: 'What the role involves and what it asks for.',
    fields: ['jobDescription', 'skillIds', 'sections', 'benefitIds'],
  },
  {
    id: 'package',
    title: 'Package',
    description: 'Pay, sponsorship and how to apply.',
    fields: ['salaryCurrency', 'salaryMin', 'salaryMax', 'visaSponsorship', 'jobLink'],
  },
] as const;

export const LAST_JOB_FORM_STEP = JOB_FORM_STEPS.length - 1;

/**
 * Which step owns a field path. Nested paths resolve to their array field, so
 * `sections.0.items.1.value` belongs to whichever step lists `sections`.
 * Returns -1 for a field no step claims.
 */
export function stepOfField(path: string): number {
  return JOB_FORM_STEPS.findIndex(step =>
    step.fields.some(f => path === f || path.startsWith(`${f}.`))
  );
}

/**
 * The step to land on when a submit fails: the earliest one holding an error.
 * Falls back to null when no error maps to a step, so the caller can stay put.
 */
export function firstStepWithError(errorPaths: string[]): number | null {
  const steps = errorPaths.map(stepOfField).filter(i => i >= 0);
  return steps.length > 0 ? Math.min(...steps) : null;
}
