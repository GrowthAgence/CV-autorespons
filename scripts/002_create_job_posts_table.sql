-- Create job_posts table for storing job opportunities
CREATE TABLE IF NOT EXISTS job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  job_type VARCHAR(100),
  salary_range VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  application_url VARCHAR(500),
  source_url VARCHAR(500),
  posted_date TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'filled')),
  raw_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_company ON job_posts(company);
