-- Add onboarding_completed field to profiles table
-- This tracks whether the user has completed the interactive onboarding tour

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
