-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de treinos
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de séries
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL DEFAULT 0,
  rest_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para workouts
CREATE POLICY "Usuários podem ver apenas seus treinos"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar treinos"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus treinos"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus treinos"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para exercises
CREATE POLICY "Usuários podem ver exercícios dos seus treinos"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar exercícios"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar exercícios"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar exercícios"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid()
    )
  );

-- Políticas RLS para workout_sets
CREATE POLICY "Usuários podem ver séries dos seus exercícios"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = workout_sets.exercise_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar séries"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = workout_sets.exercise_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar séries"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = workout_sets.exercise_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar séries"
  ON workout_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = workout_sets.exercise_id AND workouts.user_id = auth.uid()
    )
  );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Índice para performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date DESC);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);
