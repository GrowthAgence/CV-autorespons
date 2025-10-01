-- Create the database schema for job application automation
-- Based on the specification requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profile table - stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    summary TEXT,
    skills TEXT[], -- Array of skills
    experience JSONB, -- Structured experience data
    education JSONB, -- Structured education data
    certifications JSONB, -- Structured certifications data
    cv_file_url VARCHAR(500), -- URL to uploaded CV file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job posts table - stores captured job postings
CREATE TABLE IF NOT EXISTS job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    job_type VARCHAR(100), -- full-time, part-time, contract, etc.
    salary_range VARCHAR(255),
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    application_url VARCHAR(500),
    source_url VARCHAR(500), -- Original job posting URL
    posted_date DATE,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, filled
    raw_html TEXT, -- Original HTML content for reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table - tracks job applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, interview, rejected, accepted
    tailored_cv_content TEXT, -- Generated CV content
    cover_letter_content TEXT, -- Generated cover letter content
    cv_file_url VARCHAR(500), -- URL to generated CV file
    cover_letter_file_url VARCHAR(500), -- URL to generated cover letter file
    application_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    interview_date TIMESTAMP WITH TIME ZONE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails table - tracks email communications
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- application, follow_up, thank_you, etc.
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, failed
    gmail_message_id VARCHAR(255), -- Gmail API message ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_post_id ON applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_emails_application_id ON emails(application_id);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
