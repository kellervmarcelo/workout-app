-- Criar tabela de templates de treino
CREATE TABLE IF NOT EXISTS workout_templates
  (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

-- Criar tabela de exercícios do template
CREATE TABLE IF NOT EXISTS template_exercises
  (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    default_reps INTEGER NOT NULL DEFAULT 10,
    default_weight_kg DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

-- Habilitar Row Level Security
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para workout_templates
CREATE POLICY "Usuários podem ver seus templates" ON workout_templates FOR
SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar templates" ON workout_templates FOR INSERT WITH
CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus templates" ON workout_templates FOR
UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus templates" ON workout_templates FOR
DELETE USING (auth.uid() = user_id);

-- Políticas RLS para template_exercises
CREATE POLICY "Usuários podem ver exercícios dos seus templates" ON template_exercises FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
        AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar exercícios de template" ON template_exercises FOR INSERT WITH
CHECK (
    EXISTS (
      SELECT 1
      FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
        AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar exercícios de template" ON template_exercises FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
        AND workout_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar exercícios de template" ON template_exercises FOR
DELETE USING (
    EXISTS (
      SELECT 1
      FROM workout_templates
      WHERE workout_templates.id = template_exercises.template_id
        AND workout_templates.user_id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_template_exercises_template_id ON template_exercises(template_id);
