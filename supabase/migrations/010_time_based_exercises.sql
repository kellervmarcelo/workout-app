-- Tipo do exercício: reps (padrão) ou time
ALTER TABLE exercises
  ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'reps'
  CHECK (exercise_type IN ('reps', 'time'));

-- Template exercises: tipo + duração padrão
ALTER TABLE template_exercises
  ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'reps'
  CHECK (exercise_type IN ('reps', 'time')),
  ADD COLUMN default_duration_seconds INT;

-- Séries: campo de duração (NULL em sets de reps)
ALTER TABLE workout_sets
  ADD COLUMN duration_seconds INT;
