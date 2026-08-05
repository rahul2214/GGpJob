-- =============================================================================
-- SQL SEED SCRIPT FOR GLOBAL WORLD LOCATIONS & COUNTRIES
-- Table: locations (name, country)
-- Description: Inserts major global tech hubs, financial centers, and remote locations.
-- Instructions: Run this script directly in your Supabase SQL Editor.
-- =============================================================================

INSERT INTO public.locations (name, country)
VALUES
  -- Global Remote Options
  ('Remote - Worldwide', 'Global'),
  ('Remote - Americas', 'Global'),
  ('Remote - EMEA', 'Global'),
  ('Remote - APAC', 'Global'),
  ('Remote - US Only', 'United States'),
  ('Remote - Europe Only', 'Europe'),
  ('Remote - India Only', 'India'),

  -- United States
  ('San Francisco, CA', 'United States'),
  ('New York, NY', 'United States'),
  ('Austin, TX', 'United States'),
  ('Seattle, WA', 'United States'),
  ('Boston, MA', 'United States'),
  ('Chicago, IL', 'United States'),
  ('Los Angeles, CA', 'United States'),
  ('San Jose, CA', 'United States'),
  ('Denver, CO', 'United States'),
  ('Atlanta, GA', 'United States'),
  ('Miami, FL', 'United States'),
  ('Washington, D.C.', 'United States'),
  ('San Diego, CA', 'United States'),
  ('Raleigh, NC', 'United States'),
  ('Dallas, TX', 'United States'),
  ('Portland, OR', 'United States'),
  ('Phoenix, AZ', 'United States'),
  ('Salt Lake City, UT', 'United States'),

  -- Canada
  ('Toronto', 'Canada'),
  ('Vancouver', 'Canada'),
  ('Montreal', 'Canada'),
  ('Ottawa', 'Canada'),
  ('Calgary', 'Canada'),
  ('Edmonton', 'Canada'),

  -- United Kingdom
  ('London', 'United Kingdom'),
  ('Manchester', 'United Kingdom'),
  ('Edinburgh', 'United Kingdom'),
  ('Cambridge', 'United Kingdom'),
  ('Oxford', 'United Kingdom'),
  ('Bristol', 'United Kingdom'),
  ('Birmingham', 'United Kingdom'),
  ('Glasgow', 'United Kingdom'),

  -- Germany
  ('Berlin', 'Germany'),
  ('Munich', 'Germany'),
  ('Frankfurt', 'Germany'),
  ('Hamburg', 'Germany'),
  ('Cologne', 'Germany'),
  ('Stuttgart', 'Germany'),
  ('Düsseldorf', 'Germany'),

  -- France
  ('Paris', 'France'),
  ('Lyon', 'France'),
  ('Marseille', 'France'),
  ('Toulouse', 'France'),
  ('Bordeaux', 'France'),

  -- India
  ('Bengaluru', 'India'),
  ('Mumbai', 'India'),
  ('Hyderabad', 'India'),
  ('Pune', 'India'),
  ('Gurgaon', 'India'),
  ('Noida', 'India'),
  ('Chennai', 'India'),
  ('Delhi NCR', 'India'),
  ('Kolkata', 'India'),
  ('Ahmedabad', 'India'),
  ('Kochi', 'India'),

  -- Netherlands
  ('Amsterdam', 'Netherlands'),
  ('Rotterdam', 'Netherlands'),
  ('The Hague', 'Netherlands'),
  ('Utrecht', 'Netherlands'),
  ('Eindhoven', 'Netherlands'),

  -- Switzerland
  ('Zurich', 'Switzerland'),
  ('Geneva', 'Switzerland'),
  ('Basel', 'Switzerland'),
  ('Lausanne', 'Switzerland'),

  -- Singapore & UAE
  ('Singapore', 'Singapore'),
  ('Dubai', 'United Arab Emirates'),
  ('Abu Dhabi', 'United Arab Emirates'),

  -- Japan & South Korea
  ('Tokyo', 'Japan'),
  ('Osaka', 'Japan'),
  ('Kyoto', 'Japan'),
  ('Yokohama', 'Japan'),
  ('Seoul', 'South Korea'),
  ('Busan', 'South Korea'),
  ('Seongnam', 'South Korea'),

  -- Australia & New Zealand
  ('Sydney', 'Australia'),
  ('Melbourne', 'Australia'),
  ('Brisbane', 'Australia'),
  ('Perth', 'Australia'),
  ('Adelaide', 'Australia'),
  ('Auckland', 'New Zealand'),
  ('Wellington', 'New Zealand'),

  -- Sweden, Ireland & Denmark
  ('Stockholm', 'Sweden'),
  ('Gothenburg', 'Sweden'),
  ('Dublin', 'Ireland'),
  ('Cork', 'Ireland'),
  ('Copenhagen', 'Denmark'),
  ('Aarhus', 'Denmark'),

  -- Spain & Italy
  ('Madrid', 'Spain'),
  ('Barcelona', 'Spain'),
  ('Valencia', 'Spain'),
  ('Malaga', 'Spain'),
  ('Milan', 'Italy'),
  ('Rome', 'Italy'),
  ('Turin', 'Italy'),

  -- Israel & Poland
  ('Tel Aviv', 'Israel'),
  ('Jerusalem', 'Israel'),
  ('Herzliya', 'Israel'),
  ('Warsaw', 'Poland'),
  ('Kraków', 'Poland'),
  ('Wrocław', 'Poland'),
  ('Gdańsk', 'Poland'),

  -- Latin America & Others
  ('São Paulo', 'Brazil'),
  ('Rio de Janeiro', 'Brazil'),
  ('Florianópolis', 'Brazil'),
  ('Mexico City', 'Mexico'),
  ('Guadalajara', 'Mexico'),
  ('Buenos Aires', 'Argentina'),
  ('Santiago', 'Chile'),
  ('Bogotá', 'Colombia'),

  -- Middle East & Africa
  ('Riyadh', 'Saudi Arabia'),
  ('Jeddah', 'Saudi Arabia'),
  ('Cape Town', 'South Africa'),
  ('Johannesburg', 'South Africa'),
  ('Tallinn', 'Estonia'),
  ('Helsinki', 'Finland'),
  ('Oslo', 'Norway')

ON CONFLICT DO NOTHING;
