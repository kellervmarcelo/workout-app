-- Add source_template_id to workouts table
-- Allows tracking which template a workout was created from
-- Used to sync weight/reps back to the template

ALTER TABLE workouts 
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES workout_templates(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workouts_source_template 
  ON workouts(source_template_id);
