-- Adicionar campo de comentários gerais no template
ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS comments TEXT;

-- Adicionar número padrão de séries por exercício (default: 3)
ALTER TABLE template_exercises
  ADD COLUMN IF NOT EXISTS default_sets INTEGER NOT NULL DEFAULT 3;
