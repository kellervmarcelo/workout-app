-- =====================================================
-- Seed para desenvolvimento local
-- =====================================================
-- Este arquivo é carregado automaticamente após as migrações
-- ao rodar `supabase db reset`
--
-- Credenciais de teste (criar via API):
--   Email: marcos@email.com / Senha: password123
--   Email: ana@email.com    / Senha: password123
--
-- Após rodar `supabase db reset`, crie os usuários via:
--   curl -X POST http://127.0.0.1:54321/auth/v1/signup \
--     -H "Content-Type: application/json" \
--     -d '{"email":"marcos@email.com","password":"password123"}'
-- =====================================================

-- Habilitar pgcrypto (necessário para auth local)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- Criar usuários diretamente no auth.users (schema local)
-- =====================================================

-- Usuário 1: marcos@email.com
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated',
  'authenticated',
  'marcos@email.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Marcos"}'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcos@email.com');

-- Usuário 2: ana@email.com
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated',
  'authenticated',
  'ana@email.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Ana"}'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ana@email.com');

-- =====================================================
-- 3. Criar treinos, exercícios e séries para marcos
-- =====================================================

DO $$
DECLARE
  v_user_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_workout_id UUID;
  v_exercise_id UUID;
BEGIN
  -- ===== TREINO 1: Peito & Tríceps (ontem) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Peito & Tríceps', v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Foco em hipertrofia')
  RETURNING id INTO v_workout_id;

  -- Supino Reto
  INSERT INTO exercises (workout_id, name, "order")
  VALUES (v_workout_id, 'Supino Reto com Barra', 1)
  RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 60, true), (v_exercise_id, 2, 10, 70, true),
    (v_exercise_id, 3, 8, 80, true), (v_exercise_id, 4, 6, 90, true);

  -- Supino Inclinado Halteres
  INSERT INTO exercises (workout_id, name, "order")
  VALUES (v_workout_id, 'Supino Inclinado com Halteres', 2)
  RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 24, true), (v_exercise_id, 2, 10, 28, true),
    (v_exercise_id, 3, 10, 28, true), (v_exercise_id, 4, 8, 32, true);

  -- Crucifixo
  INSERT INTO exercises (workout_id, name, "order")
  VALUES (v_workout_id, 'Crucifixo na Máquina', 3)
  RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 40, true), (v_exercise_id, 2, 12, 50, true), (v_exercise_id, 3, 12, 50, true);

  -- Tríceps Corda
  INSERT INTO exercises (workout_id, name, "order")
  VALUES (v_workout_id, 'Tríceps Corda', 4)
  RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 15, true), (v_exercise_id, 2, 12, 15, true),
    (v_exercise_id, 3, 10, 20, true), (v_exercise_id, 4, 10, 20, true);

  -- Tríceps Testa
  INSERT INTO exercises (workout_id, name, "order")
  VALUES (v_workout_id, 'Tríceps Testa', 5)
  RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 20, true), (v_exercise_id, 2, 10, 25, true), (v_exercise_id, 3, 8, 30, true);

  -- ===== TREINO 2: Costas & Bíceps (3 dias atrás) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Costas & Bíceps', v_user_id, CURRENT_DATE - INTERVAL '3 days', 'Dia pesado')
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Puxada Frontal', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 50, true), (v_exercise_id, 2, 10, 60, true),
    (v_exercise_id, 3, 8, 70, true), (v_exercise_id, 4, 8, 70, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Remada Curvada com Barra', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 50, true), (v_exercise_id, 2, 10, 60, true),
    (v_exercise_id, 3, 8, 70, true), (v_exercise_id, 4, 6, 80, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Remada Unilateral com Haltere', 3) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 22, true), (v_exercise_id, 2, 10, 26, true), (v_exercise_id, 3, 10, 26, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Puxada Triângulo', 4) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 55, true), (v_exercise_id, 2, 10, 65, true), (v_exercise_id, 3, 10, 65, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Rosca Direta com Barra', 5) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 25, true), (v_exercise_id, 2, 10, 30, true), (v_exercise_id, 3, 8, 35, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Rosca Alternada com Halteres', 6) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 12, true), (v_exercise_id, 2, 10, 14, true), (v_exercise_id, 3, 10, 14, true);

  -- ===== TREINO 3: Pernas (5 dias atrás) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Pernas', v_user_id, CURRENT_DATE - INTERVAL '5 days', 'Agachamento pesado!')
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Agachamento Livre', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 60, true), (v_exercise_id, 2, 10, 80, true),
    (v_exercise_id, 3, 8, 100, true), (v_exercise_id, 4, 6, 110, true), (v_exercise_id, 5, 6, 110, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Leg Press 45°', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 180, true), (v_exercise_id, 2, 10, 220, true),
    (v_exercise_id, 3, 10, 220, true), (v_exercise_id, 4, 8, 260, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Cadeira Extensora', 3) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 50, true), (v_exercise_id, 2, 12, 60, true), (v_exercise_id, 3, 10, 70, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Mesa Flexora', 4) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 35, true), (v_exercise_id, 2, 12, 35, true), (v_exercise_id, 3, 10, 40, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Panturrilha no Smith', 5) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 60, true), (v_exercise_id, 2, 15, 60, true),
    (v_exercise_id, 3, 12, 70, true), (v_exercise_id, 4, 12, 70, true);

  -- ===== TREINO 4: Ombros & Trapézio (7 dias atrás) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Ombros & Trapézio', v_user_id, CURRENT_DATE - INTERVAL '7 days', NULL)
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Desenvolvimento Militar', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 40, true), (v_exercise_id, 2, 10, 50, true),
    (v_exercise_id, 3, 8, 60, true), (v_exercise_id, 4, 6, 65, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Elevação Lateral', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 8, true), (v_exercise_id, 2, 12, 10, true),
    (v_exercise_id, 3, 12, 10, true), (v_exercise_id, 4, 10, 12, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Elevação Frontal com Haltere', 3) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 10, true), (v_exercise_id, 2, 12, 10, true), (v_exercise_id, 3, 10, 12, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Face Pull na Polia', 4) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 15, true), (v_exercise_id, 2, 12, 20, true), (v_exercise_id, 3, 12, 20, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Encolhimento com Halteres', 5) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 30, true), (v_exercise_id, 2, 12, 36, true), (v_exercise_id, 3, 12, 36, true);

  -- ===== TREINO 5: Hoje (em progresso) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Peito & Tríceps', v_user_id, CURRENT_DATE, 'Treino de hoje')
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Supino Reto com Barra', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 60, true), (v_exercise_id, 2, 10, 70, true),
    (v_exercise_id, 3, 8, 80, false);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Supino Inclinado com Halteres', 2) RETURNING id INTO v_exercise_id;
END $$;

-- =====================================================
-- 4. Criar treinos para ana
-- =====================================================
DO $$
DECLARE
  v_user_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_workout_id UUID;
  v_exercise_id UUID;
BEGIN
  -- ===== TREINO 1: Superior A (2 dias atrás) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Superior A', v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Foco em membros superiores')
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Puxada Frontal', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 35, true), (v_exercise_id, 2, 10, 40, true), (v_exercise_id, 3, 10, 40, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Remada Sentada', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 35, true), (v_exercise_id, 2, 12, 35, true), (v_exercise_id, 3, 10, 40, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Supino na Máquina', 3) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 30, true), (v_exercise_id, 2, 10, 35, true), (v_exercise_id, 3, 10, 35, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Desenvolvimento com Halteres', 4) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 8, true), (v_exercise_id, 2, 10, 10, true), (v_exercise_id, 3, 10, 10, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Elevação Lateral', 5) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 4, true), (v_exercise_id, 2, 12, 6, true), (v_exercise_id, 3, 12, 6, true);

  -- ===== TREINO 2: Inferior A (4 dias atrás) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Inferior A', v_user_id, CURRENT_DATE - INTERVAL '4 days', NULL)
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Agachamento Goblet', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 16, true), (v_exercise_id, 2, 12, 20, true),
    (v_exercise_id, 3, 12, 20, true), (v_exercise_id, 4, 10, 24, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Stiff', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 30, true), (v_exercise_id, 2, 10, 40, true), (v_exercise_id, 3, 10, 40, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Leg Press 45°', 3) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 12, 120, true), (v_exercise_id, 2, 12, 140, true), (v_exercise_id, 3, 10, 160, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Cadeira Adutora', 4) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 45, true), (v_exercise_id, 2, 12, 55, true), (v_exercise_id, 3, 12, 55, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Panturrilha Sentada', 5) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 15, 25, true), (v_exercise_id, 2, 15, 25, true), (v_exercise_id, 3, 12, 30, true);

  -- ===== TREINO 3: Hoje (em progresso) =====
  INSERT INTO workouts (name, user_id, date, notes)
  VALUES ('Superior B', v_user_id, CURRENT_DATE, 'Treino de hoje')
  RETURNING id INTO v_workout_id;

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Levantamento Terra', 1) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 10, 40, true), (v_exercise_id, 2, 8, 50, true);

  INSERT INTO exercises (workout_id, name, "order") VALUES (v_workout_id, 'Barra Fixa Assistida', 2) RETURNING id INTO v_exercise_id;
  INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES
    (v_exercise_id, 1, 8, 20, true);
END $$;
