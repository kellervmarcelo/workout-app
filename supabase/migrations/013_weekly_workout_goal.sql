ALTER TABLE profiles
  ADD COLUMN weekly_workout_goal INTEGER NOT NULL DEFAULT 3
  CHECK (weekly_workout_goal BETWEEN 1 AND 7);
