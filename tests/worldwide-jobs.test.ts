import { describe, expect, it } from 'vitest';
import {
  WORLDWIDE_COUNTRY_ID,
  WORLDWIDE_COUNTRY_NAME,
  isOpenToAllCountries,
  isRemoteWorkplace,
  isWorldwideCountryId,
  normalizeJobLocations,
  resolveRemoteType,
  toJobLocationRows,
} from '@/lib/worldwide';
import { matchesCountry } from '@/lib/recommendation-engine';

describe('isWorldwideCountryId', () => {
  it('recognises the sentinel as a number and as a string', () => {
    expect(isWorldwideCountryId(-1)).toBe(true);
    expect(isWorldwideCountryId('-1')).toBe(true);
  });

  it('rejects real countries and empty values', () => {
    for (const v of [1, '1', 0, null, undefined, '', 'India', NaN]) {
      expect(isWorldwideCountryId(v)).toBe(false);
    }
  });
});

describe('normalizeJobLocations', () => {
  it('collapses the open-to-all flag to the single sentinel row', () => {
    const result = normalizeJobLocations({
      openToAllCountries: true,
      locations: [{ countryId: 2, stateId: 11, cityId: 33 }],
    });

    expect(result.error).toBeNull();
    expect(result.openToAllCountries).toBe(true);
    expect(result.locations).toEqual([{ countryId: WORLDWIDE_COUNTRY_ID, stateId: null, cityId: null }]);
  });

  it('treats a -1 country in the locations array as open to all', () => {
    const result = normalizeJobLocations({ locations: [{ countryId: -1 }] });

    expect(result.openToAllCountries).toBe(true);
    expect(result.locations).toEqual([{ countryId: WORLDWIDE_COUNTRY_ID, stateId: null, cityId: null }]);
  });

  it('never stores a state or city alongside the sentinel', () => {
    const result = normalizeJobLocations({
      openToAllCountries: true,
      locations: [{ countryId: -1, stateId: 11, cityId: 33 }],
    });

    expect(result.locations[0].stateId).toBeNull();
    expect(result.locations[0].cityId).toBeNull();
  });

  it('keeps specific countries when the flag is off', () => {
    const result = normalizeJobLocations({
      locations: [
        { countryId: 1, stateId: 5, cityId: 9 },
        { countryId: '2', stateId: null, cityId: null },
      ],
    });

    expect(result.error).toBeNull();
    expect(result.openToAllCountries).toBe(false);
    expect(result.locations).toEqual([
      { countryId: 1, stateId: 5, cityId: 9 },
      { countryId: 2, stateId: null, cityId: null },
    ]);
  });

  it('accepts the legacy flat countryId fields', () => {
    const result = normalizeJobLocations({ countryId: 3, stateId: 7, cityId: null });
    expect(result.locations).toEqual([{ countryId: 3, stateId: 7, cityId: null }]);
  });

  it('drops empty rows the recruiter added but never filled in', () => {
    const result = normalizeJobLocations({
      locations: [{ countryId: 1 }, { countryId: null, stateId: null, cityId: null }],
    });

    expect(result.error).toBeNull();
    expect(result.locations).toEqual([{ countryId: 1, stateId: null, cityId: null }]);
  });

  it('de-duplicates identical rows', () => {
    const result = normalizeJobLocations({
      locations: [{ countryId: 1, cityId: 9 }, { countryId: 1, cityId: 9 }],
    });
    expect(result.locations).toHaveLength(1);
  });

  it('rejects a location that names a city but no country instead of guessing one', () => {
    const result = normalizeJobLocations({ locations: [{ cityId: 33 }] });

    expect(result.error).toMatch(/needs a country/i);
    expect(result.locations).toEqual([]);
  });

  it('rejects a payload with no usable location at all', () => {
    const result = normalizeJobLocations({ locations: [] });
    expect(result.error).toMatch(/Location is required/i);
  });

  it('rejects a negative country id that is not the sentinel', () => {
    const result = normalizeJobLocations({ locations: [{ countryId: -5 }] });
    expect(result.error).toMatch(/Invalid country/i);
  });
});

describe('toJobLocationRows', () => {
  it('marks the first row primary and carries the sentinel through', () => {
    const rows = toJobLocationRows(42, [{ countryId: WORLDWIDE_COUNTRY_ID, stateId: null, cityId: null }]);

    expect(rows).toEqual([
      { job_id: 42, country_id: -1, state_province_id: null, city_id: null, is_primary: true },
    ]);
  });

  it('only marks one row primary for a multi-country job', () => {
    const rows = toJobLocationRows(7, [
      { countryId: 1, stateId: null, cityId: null },
      { countryId: 2, stateId: null, cityId: null },
    ]);

    expect(rows.filter(r => r.is_primary)).toHaveLength(1);
    expect(rows[0].is_primary).toBe(true);
  });
});

describe('isOpenToAllCountries', () => {
  it('reads the mapped flag from either casing', () => {
    expect(isOpenToAllCountries({ openToAllCountries: true })).toBe(true);
    expect(isOpenToAllCountries({ open_to_all_countries: true })).toBe(true);
  });

  it('reads the raw job_locations rows', () => {
    expect(isOpenToAllCountries({ jobLocations: [{ countryId: -1 }] })).toBe(true);
    expect(isOpenToAllCountries({ jobLocations: [{ country_id: -1 }] })).toBe(true);
    expect(isOpenToAllCountries({ jobLocations: [{ countryId: 1 }] })).toBe(false);
  });

  it('falls back to the resolved country name for name-only payloads', () => {
    expect(isOpenToAllCountries({ country: WORLDWIDE_COUNTRY_NAME })).toBe(true);
    expect(isOpenToAllCountries({ locations: ['Worldwide'] })).toBe(true);
    expect(isOpenToAllCountries({ country: 'India' })).toBe(false);
  });

  it('is false for an ordinary job and for nothing at all', () => {
    expect(isOpenToAllCountries({ country: 'India', locations: ['Pune, Maharashtra, India'] })).toBe(false);
    expect(isOpenToAllCountries(null)).toBe(false);
  });
});

describe('matchesCountry with worldwide jobs', () => {
  const worldwideJob = { country: WORLDWIDE_COUNTRY_NAME, openToAllCountries: true, locations: ['Worldwide'] };
  const indiaJob = { country: 'India', locations: ['Pune, Maharashtra, India'] };

  it('shows a worldwide job to a jobseeker in any country', () => {
    for (const country of ['India', 'United States', 'Germany', 'Brazil']) {
      expect(matchesCountry(worldwideJob, country)).toBe(true);
    }
  });

  it('still hides a single-country job from a jobseeker elsewhere', () => {
    expect(matchesCountry(indiaJob, 'Germany')).toBe(false);
    expect(matchesCountry(indiaJob, 'India')).toBe(true);
  });

  it('matches a worldwide job carrying only the country name', () => {
    expect(matchesCountry({ country: 'Worldwide' }, 'Japan')).toBe(true);
  });
});

describe('isRemoteWorkplace', () => {
  it('is true when the workplace type says remote', () => {
    expect(isRemoteWorkplace('Remote', null)).toBe(true);
    expect(isRemoteWorkplace('Fully Remote', null)).toBe(true);
  });

  it('falls back to remoteType only when no workplace type is set', () => {
    expect(isRemoteWorkplace(null, 'remote')).toBe(true);
    expect(isRemoteWorkplace('', 'remote')).toBe(true);
  });

  it('lets the workplace type override a contradictory remoteType', () => {
    // Otherwise a client could smuggle a worldwide on-site job past the check.
    expect(isRemoteWorkplace('On-site', 'remote')).toBe(false);
    expect(isRemoteWorkplace('Hybrid', 'remote')).toBe(false);
  });

  it('is false for on-site, hybrid and unknown types', () => {
    expect(isRemoteWorkplace('On-site', 'onsite')).toBe(false);
    expect(isRemoteWorkplace('Hybrid', 'hybrid')).toBe(false);
    expect(isRemoteWorkplace(null, null)).toBe(false);
  });
});

describe('resolveRemoteType', () => {
  it('mirrors the workplace type the recruiter picked', () => {
    expect(resolveRemoteType('Remote', null)).toBe('remote');
    expect(resolveRemoteType('Hybrid', null)).toBe('hybrid');
    expect(resolveRemoteType('On-site', null)).toBe('onsite');
  });

  it('does not let a stale remoteType contradict the workplace type', () => {
    expect(resolveRemoteType('On-site', 'remote')).toBe('onsite');
    expect(resolveRemoteType('Remote', 'onsite')).toBe('remote');
  });

  it('defaults to onsite for an unknown or missing type', () => {
    expect(resolveRemoteType(null, null)).toBe('onsite');
    expect(resolveRemoteType('Flexible / Any', null)).toBe('onsite');
  });
});
