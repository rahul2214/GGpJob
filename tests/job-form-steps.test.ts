import { describe, expect, it } from 'vitest';
import {
  JOB_FORM_STEPS,
  LAST_JOB_FORM_STEP,
  firstStepWithError,
  stepOfField,
} from '@/lib/job-form-steps';

/**
 * Every field the job form's zod schema can reject. If a validated field is not
 * claimed by a step, a submit can fail on a panel the recruiter cannot open and
 * the form becomes impossible to complete — so this list is the contract.
 */
const VALIDATED_FIELDS = [
  'jobTitle',          // min length
  'companyName',       // min length
  'locations',         // min 1, plus the per-location country refinement
  'jobDescription',    // min length
  'minExperience',     // min 0
  'maxExperience',     // min 0, plus the >= minExperience refinement
  'jobTypeId',         // required
  'workplaceTypeId',   // required
  'vacancies',         // min 1
  'companyWebsite',    // url
  'companyLinkedinUrl',// url
  'jobLink',           // url
  'skillIds',          // min 1
  'salaryMin',         // min 0
  'salaryMax',         // min 0
  'sections',          // nested title/item validation
];

describe('job form step map', () => {
  it('claims every field the schema can reject', () => {
    const unclaimed = VALIDATED_FIELDS.filter(f => stepOfField(f) === -1);
    expect(unclaimed).toEqual([]);
  });

  it('assigns each field to exactly one step', () => {
    const seen = new Map<string, string>();
    for (const step of JOB_FORM_STEPS) {
      for (const field of step.fields) {
        expect(seen.has(field), `"${field}" is claimed by two steps`).toBe(false);
        seen.set(field, step.id);
      }
    }
  });

  it('asks for the workplace type before the location step needs it', () => {
    // The "open to all countries" toggle is only offered for a remote role, so
    // the recruiter has to have chosen the workplace type by then.
    expect(stepOfField('workplaceTypeId')).toBeLessThan(stepOfField('openToAllCountries'));
    expect(stepOfField('workplaceTypeId')).toBeLessThan(stepOfField('locations'));
  });

  it('keeps both experience bounds on one step so their refinement can show', () => {
    // The max >= min refinement reports on maxExperience; if the two sat on
    // different steps, one could be edited without the other revalidating.
    expect(stepOfField('minExperience')).toBe(stepOfField('maxExperience'));
  });

  it('resolves nested field array paths to their owning step', () => {
    const detailsStep = stepOfField('sections');
    expect(stepOfField('sections.0.title')).toBe(detailsStep);
    expect(stepOfField('sections.2.items.5.value')).toBe(detailsStep);

    const locationStep = stepOfField('locations');
    expect(stepOfField('locations.0.countryId')).toBe(locationStep);
  });

  it('does not let a prefix collision steal a field', () => {
    // "salaryMin" must not be swallowed by a step that only lists "salary".
    expect(stepOfField('salaryMin')).toBe(stepOfField('salaryMax'));
    expect(stepOfField('jobTitle')).not.toBe(-1);
    expect(stepOfField('jobLink')).not.toBe(stepOfField('jobTitle'));
  });

  it('returns -1 for a field no step owns', () => {
    expect(stepOfField('notAFieldOnThisForm')).toBe(-1);
  });
});

describe('firstStepWithError', () => {
  it('picks the earliest step holding an error', () => {
    // jobLink is on the last step, jobTitle on the first.
    expect(firstStepWithError(['jobLink', 'jobTitle'])).toBe(0);
    expect(firstStepWithError(['jobLink', 'locations'])).toBe(stepOfField('locations'));
  });

  it('ignores errors on fields that belong to no step', () => {
    expect(firstStepWithError(['mysteryField', 'jobDescription'])).toBe(stepOfField('jobDescription'));
  });

  it('returns null when nothing maps, so the caller stays put', () => {
    expect(firstStepWithError([])).toBeNull();
    expect(firstStepWithError(['mysteryField'])).toBeNull();
  });
});

describe('step definitions', () => {
  it('has a last-step index matching the list', () => {
    expect(LAST_JOB_FORM_STEP).toBe(JOB_FORM_STEPS.length - 1);
    expect(JOB_FORM_STEPS[LAST_JOB_FORM_STEP].id).toBe('package');
  });

  it('gives every step a unique id, a title and a description', () => {
    const ids = JOB_FORM_STEPS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const step of JOB_FORM_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
      expect(step.fields.length).toBeGreaterThan(0);
    }
  });
});
