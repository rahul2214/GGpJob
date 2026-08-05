-- migration script to setup communities module tables and seed default communities

-- 1. Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL, -- 'Technology', 'Career', 'Countries', 'Companies'
    cover_image TEXT,
    icon TEXT, -- Lucide icon name
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    community_id BIGINT REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_uuid)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_uuid);

-- 3. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    community_id BIGINT REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    author_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL CHECK (post_type IN ('discussion', 'question', 'experience', 'review', 'success', 'alert', 'resource', 'poll', 'announcement', 'image', 'video', 'link')),
    metadata JSONB DEFAULT '{}'::jsonb, -- Poll options, links, attachments
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_comm ON public.community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_uuid);

-- 4. Community Comments Table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    parent_id BIGINT REFERENCES public.community_comments(id) ON DELETE CASCADE,
    author_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id);

-- 5. Reactions Table
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.community_comments(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'celebrate', 'insightful', 'helpful', 'love', 'funny')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_comm_react_post ON public.community_reactions(user_uuid, post_id) WHERE comment_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_comm_react_comment ON public.community_reactions(user_uuid, comment_id) WHERE post_id IS NULL;

-- 6. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.community_bookmarks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_uuid, post_id)
);

-- 7. Abuse Reports Table
CREATE TABLE IF NOT EXISTS public.community_reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporter_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id BIGINT REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.community_comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'fake jobs', 'scams', 'duplicate')),
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- 8. Community Events Table
CREATE TABLE IF NOT EXISTS public.community_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    community_id BIGINT REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    creator_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('live_session', 'mock_interview', 'career_talk', 'ama', 'webinar', 'coding_contest')),
    start_time TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    meeting_link TEXT,
    speakers JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.community_event_registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_uuid)
);

-- 10. Learning Resources Table
CREATE TABLE IF NOT EXISTS public.community_resources (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    community_id BIGINT REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    creator_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('roadmap', 'pdf', 'article', 'video', 'github', 'link', 'practice_question', 'coding_challenge')),
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. User Community Reputation XP Table
CREATE TABLE IF NOT EXISTS public.community_user_xp (
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    xp INTEGER DEFAULT 0 NOT NULL,
    level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Contributor', 'Expert', 'Mentor', 'Community Leader')),
    badges JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Seed Default Communities
INSERT INTO public.communities (name, description, category, icon) VALUES
-- Technology
('React Developers', 'Discussion and networking for React and React Native web/mobile developers.', 'Technology', 'Atom'),
('Next.js', 'Discuss the Next.js React Framework for production, SSR, and ISR architectures.', 'Technology', 'Layers'),
('Node.js', 'Backend engineering, server design, APIs, and Javascript/Typescript runtimes.', 'Technology', 'Server'),
('Python', 'General Python discussions, Django/Flask backends, scripting, and packages.', 'Technology', 'Braces'),
('Java', 'JVM technologies, Spring Boot architectures, enterprise application design.', 'Technology', 'Coffee'),
('AI & Machine Learning', 'Artificial Intelligence, LLMs, neural networks, machine learning libraries.', 'Technology', 'Cpu'),
('Data Science', 'Data analysis, visualization, engineering, pandas, numpy, and databases.', 'Technology', 'Database'),
('DevOps', 'CI/CD pipelines, Docker, Kubernetes, monitoring, and site reliability engineering.', 'Technology', 'GitBranch'),
('Cyber Security', 'Penetration testing, encryption, network security, threat detection, and compliance.', 'Technology', 'ShieldAlert'),
('Cloud Computing', 'AWS, Google Cloud, Azure setups, architecture designs, serverless configs.', 'Technology', 'Cloud'),
('Flutter', 'Cross-platform mobile application development using Google Dart framework.', 'Technology', 'Smartphone'),
('Android', 'Kotlin and Java native mobile application development and Gradle architectures.', 'Technology', 'Android'),
('iOS', 'Swift and Objective-C native iOS/macOS application developments.', 'Technology', 'Apple'),
('UI/UX Design', 'Figma prototypes, layout designs, user research, wireframing, and user journeys.', 'Technology', 'Framer'),
('Graphic Design', 'Visual assets, logos, brand guides, vector drawings, Photoshop and Illustrator.', 'Technology', 'Palette'),

-- Career
('Resume Reviews', 'Post your resume as PDF/text to get direct, constructive feedback from professionals.', 'Career', 'FileText'),
('Mock Interviews', 'Coordinate mock sessions, share interview prep checklists, and practice questions.', 'Career', 'Users'),
('Career Guidance', 'General workplace discussions, transitioning domains, negotiation, and promotions.', 'Career', 'Compass'),
('Freshers', 'Entry-level careers, search advice, internship tips, and learning roadmaps.', 'Career', 'GraduationCap'),
('Remote Jobs', 'Remote lifestyle, global companies, digital nomad tips, and tax handling.', 'Career', 'Globe'),
('Freelancing', 'Upwork setups, contractor invoice templates, scaling clients, and portfolio guides.', 'Career', 'Laptop'),

-- Countries
('India Jobs', 'Job listings, visa checks, corporate hubs, and salary ranges across India.', 'Countries', 'Globe'),
('USA Jobs', 'Working visas (H-1B, L-1, O-1), recruitment cycles, and tech hubs in the USA.', 'Countries', 'Globe'),
('Canada Jobs', 'Canadian PR, Express Entry pathways, LMIA verification, and corporate jobs.', 'Countries', 'Globe'),
('Germany Jobs', 'Blue Card setups, language goals, EU relocation guidelines, and German offices.', 'Countries', 'Globe'),
('United Kingdom', 'Skilled Worker visa routes, sponsorship checks, and UK corporate job listings.', 'Countries', 'Globe'),
('Australia', 'PR subclass visas, recruiter lists, and corporate relocations down under.', 'Countries', 'Globe'),
('Singapore', 'EP passes, Singapore visa limits, and fintech/tech hubs setups.', 'Countries', 'Globe'),
('UAE', 'Dubai & Abu Dhabi tax-free setups, relocation networks, and employment checks.', 'Countries', 'Globe'),

-- Companies
('Google Careers', 'Interview loops, Leetcode patterns, G-level scales, and referral discussions.', 'Companies', 'Building2'),
('Microsoft Careers', 'Loop checklists, Redmond relocations, Azure divisions, and interview feedback.', 'Companies', 'Building2'),
('Amazon Careers', 'Leadership Principles, SDE loops, compensation limits, and PIP feedback.', 'Companies', 'Building2'),
('Meta Careers', 'Systems design loops, product architecture prep, and bootcamp guidelines.', 'Companies', 'Building2'),
('Apple Careers', 'Loop prep, hardware/software divisions, Apple office culture guides.', 'Companies', 'Building2'),
('Netflix Careers', 'Freedom & Responsibility culture guidelines, loop interviews, scale reviews.', 'Companies', 'Building2'),
('Adobe Careers', 'Software engineer loops, creative divisions, product team reviews.', 'Companies', 'Building2'),
('Infosys', 'Infosys certifications, onboarding guidelines, bench setups, off-campus loops.', 'Companies', 'Building2'),
('TCS', 'TCS Ninja/Digital assessments, onboarding guidelines, bench processes.', 'Companies', 'Building2'),
('Accenture', 'Accenture recruitment loops, consulting setups, level grids, and client tasks.', 'Companies', 'Building2')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category, icon = EXCLUDED.icon;
