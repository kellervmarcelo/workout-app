ALTER TABLE workouts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Backfill: marca como concluídos os treinos históricos que já têm todas as séries marcadas
UPDATE workouts w
SET completed_at = w.created_at
WHERE (
  SELECT COUNT(*)
  FROM exercises e
  JOIN workout_sets ws ON ws.exercise_id = e.id
  WHERE e.workout_id = w.id
) > 0
AND (
  SELECT COUNT(*)
  FROM exercises e
  JOIN workout_sets ws ON ws.exercise_id = e.id
  WHERE e.workout_id = w.id
    AND ws.completed = false
) = 0;
