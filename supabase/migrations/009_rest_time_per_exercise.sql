-- Tempo padrão de descanso por exercício no template
ALTER TABLE template_exercises
  ADD COLUMN IF NOT EXISTS default_rest_seconds INTEGER NOT NULL DEFAULT 60;

-- Tempo de descanso propagado para o exercício do treino
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS rest_seconds INTEGER NOT NULL DEFAULT 60;
