# JobsDart – Core Job Recommendation System Refactor (International Version)

## Objective

Refactor the JobsDart platform to support a true international job marketplace. The existing recommendation logic is heavily dependent on **Domains**, which is no longer part of the product strategy. The recommendation engine, database schema, backend APIs, and frontend must be redesigned to provide intelligent, personalized job recommendations without using domain-based categorization.

This is a core architectural change, not a UI-only update.

---

# 2. Replace Recommendation Logic

Implement a relevance-based recommendation engine.

Every job should receive a relevance score for the logged-in user.

The recommendation score should consider the following factors:

### Primary Factors

* Skills Match
* Preferred Job Titles
* Experience Match
* Country
* State / Province
* City (optional)
* Remote Preference
* Employment Type
* Salary Expectation
* Preferred Industries
* Visa Sponsorship Requirement
* Work Authorization
* Preferred Languages

### Secondary Factors

* Recently Posted Jobs
* Company Verification Status
* Company Activity
* Company Rating
* User Search History
* Saved Jobs
* Previously Applied Jobs
* Click History

Jobs must be ranked using a weighted scoring algorithm instead of chronological ordering.

---

# 3. Homepage Layout

Replace the existing recommendation sections with:

* Recommended For You
* Jobs Near You
* Remote Jobs
* Recently Posted
* Top Companies Hiring
* Jobs Matching Your Skills
* High Salary Jobs
* Internship Opportunities
* Contract Jobs
* Part-Time Jobs
* Visa Sponsorship Jobs
* Trending Jobs

Do not display any "Recommended based on Domain" sections.

---

# 4. User Profile Refactor

Update the user profile model.

Required fields:

* Country
* State / Province
* City
* Preferred Job Titles (multiple)
* Skills (multiple)
* Experience
* Preferred Salary Min
* Preferred Salary Max
* Preferred Currency
* Remote Preference
* Employment Types
* Preferred Industries
* Open To Relocate
* Open Worldwide
* Work Authorization
* Visa Requirement
* Preferred Languages

Remove every Domain-related field.

---

# 5. Job Model Refactor

Update the Job entity.

Required fields:

* Job Title
* Company
* Country
* State
* City
* Latitude
* Longitude
* Remote Type
* Employment Type
* Salary Min
* Salary Max
* Salary Currency
* Experience Min
* Experience Max
* Required Skills
* Industry
* Job Function
* Visa Sponsorship
* Work Authorization Requirement
* Languages
* Posted Date
* Expiry Date
* Company Verification
* Company Rating

Remove every Domain column.

---

# 6. Database Migration

Create proper database migrations.

Tasks:

* Remove obsolete Domain tables (if unused).
* Drop Domain foreign keys.
* Remove Domain indexes.
* Remove Domain mapping tables.
* Remove Domain-related seed data.
* Add new fields required for international job matching.
* Add indexes for:

  * Skills
  * Job Title
  * Country
  * State
  * City
  * Remote Type
  * Employment Type
  * Salary
  * Experience
  * Industry
  * Posted Date

Do not leave unused columns in production.

---

# 7. API Refactor

Update all APIs.

Remove:

* Domain parameters
* Domain filtering
* Domain validation
* Domain joins
* Domain responses

Replace with filtering by:

* Skills
* Job Title
* Country
* State
* City
* Remote
* Experience
* Salary
* Employment Type
* Industry
* Visa Sponsorship

Ensure backward compatibility where possible or version the API appropriately.

---

# 8. Search Improvements

Implement intelligent search.

Users should be able to search using:

* Job Title
* Skills
* Company
* Country
* State
* City
* Remote
* Industry
* Employment Type

Search should support:

* Partial matches
* Multiple keywords
* Synonyms
* Ranking by relevance

---

# 9. Recommendation Engine

Implement a reusable recommendation service.

Suggested scoring weights:

* Skills Match – 35%
* Location Match – 20%
* Job Title Match – 15%
* Experience Match – 10%
* Salary Match – 5%
* Remote Preference – 5%
* Job Freshness – 5%
* User Behaviour – 3%
* Company Quality – 2%

The weights should be configurable so they can be tuned without changing business logic.

---

# 10. International Support

The platform must support worldwide hiring.

Requirements:

* Multi-country support
* Multiple currencies
* Timezone-aware dates
* Visa sponsorship filtering
* Country-specific work authorization
* Remote worldwide jobs
* Country-specific salary display
* International address structure

Do not assume India-specific logic anywhere in the system.

---

# 11. Performance

Optimize for scale.

* Prevent N+1 queries.
* Use pagination everywhere.
* Add proper database indexes.
* Cache recommendation results where appropriate.
* Lazy-load homepage sections.
* Optimize joins and queries.
* Ensure recommendation queries remain performant with millions of jobs.

---

# 12. Frontend Cleanup

Update the UI to reflect the new architecture.

Remove:

* Domain cards
* Domain dropdowns
* Domain filters
* Domain recommendations
* Domain badges
* Domain chips

Replace them with:

* Skills
* Job Titles
* Industries
* Countries
* Remote Type
* Experience
* Salary
* Employment Type

---

# 13. Code Cleanup

Perform a complete repository audit.

Remove:

* Dead code
* Unused components
* Deprecated APIs
* Unused services
* Unused database models
* Obsolete helper functions
* Domain-related constants
* Domain enums
* Domain TypeScript types
* Domain validation schemas

No legacy domain logic should remain.

---

# 14. Testing

Update and execute:

* Unit Tests
* Integration Tests
* API Tests
* Recommendation Tests
* Search Tests
* Migration Tests
* End-to-End Tests

Verify that recommendations are generated correctly for users from different countries, experience levels, and preferences.

---

# Definition of Done

The refactor is complete only when:

* There are no Domain-based recommendations anywhere in the application.
* The database schema is fully aligned with the new international architecture.
* Recommendation logic is based on user profile relevance instead of domains.
* APIs, frontend, and backend use the new schema consistently.
* Existing functionality remains stable after migration.
* Performance is maintained or improved.
* The codebase is clean, modular, scalable, and production-ready.

Treat this as a **high-priority architectural refactor**, not a cosmetic change. Apply senior software engineering practices, ensure backward compatibility where appropriate, and deliver a maintainable, extensible foundation for JobsDart's global expansion.
