-- Create applications table for tracking job applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'interview', 'rejected', 'accepted')),
  tailored_cv_content TEXT,
  cover_letter_content TEXT,
  cv_file_url VARCHAR(500),
  cover_letter_file_url VARCHAR(500),
  application_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  interview_date TIMESTAMP WITH TIME ZONE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_post_id ON applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
