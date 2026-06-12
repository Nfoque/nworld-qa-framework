-- Add FK from engine_jobs.created_by to user_profiles so PostgREST can resolve the join
ALTER TABLE engine_jobs
  ADD CONSTRAINT fk_engine_jobs_creator_profile
  FOREIGN KEY (created_by) REFERENCES user_profiles(id);
