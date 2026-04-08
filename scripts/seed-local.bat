@echo off
REM Script para popular o banco local com dados de teste
REM Uso: seed-local.bat

echo === Criando usuarios via signup API...
curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" -H "Content-Type: application/json" -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" -d "{\"email\":\"marcos@email.com\",\"password\":\"password123\"}" > nul 2>&1
curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" -H "Content-Type: application/json" -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" -d "{\"email\":\"ana@email.com\",\"password\":\"password123\"}" > nul 2>&1
echo Usuarios criados!

echo === Obtendo UUIDs dos usuarios...
for /f "tokens=*" %%i in ('docker exec -i supabase_db_workout-app psql -U postgres -d postgres -t -c "SELECT id::text FROM auth.users WHERE email = 'marcos@email.com';"') do set MARCOS_ID=%%i
for /f "tokens=*" %%i in ('docker exec -i supabase_db_workout-app psql -U postgres -d postgres -t -c "SELECT id::text FROM auth.users WHERE email = 'ana@email.com';"') do set ANA_ID=%%i

echo Marcos ID: %MARCOS_ID%
echo Ana ID: %ANA_ID%

REM Remover espacos
set MARCOS_ID=%MARCOS_ID: =%
set ANA_ID=%ANA_ID: =%

echo === Inserindo dados de treinos e templates...
docker exec -i supabase_db_workout-app psql -U postgres -d postgres -c "DELETE FROM workout_templates WHERE user_id IN ('%MARCOS_ID%', '%ANA_ID%'); DELETE FROM workouts WHERE user_id IN ('%MARCOS_ID%', '%ANA_ID%');"

REM Criar arquivo SQL temporario com os UUIDs corretos
echo DO $$ > temp-seed.sql
echo DECLARE v_user_id UUID := '%MARCOS_ID%'; v_workout_id UUID; v_exercise_id UUID; v_template_id UUID;
echo BEGIN
echo INSERT INTO workouts (name, user_id, date, notes) VALUES ('Peito ^& Triceps', v_user_id, CURRENT_DATE - INTERVAL '1 day', 'Foco em hipertrofia') RETURNING id INTO v_workout_id;
echo INSERT INTO exercises (workout_id, name, \"order\") VALUES (v_workout_id, 'Supino Reto com Barra', 1) RETURNING id INTO v_exercise_id;
echo INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES (v_exercise_id, 1, 12, 60, true), (v_exercise_id, 2, 10, 70, true), (v_exercise_id, 3, 8, 80, true);
echo.
echo INSERT INTO workout_templates (name, user_id, description) VALUES ('Peito ^& Triceps - Hipertrofia', v_user_id, 'Foco em hipertrofia com progressao de carga') RETURNING id INTO v_template_id;
echo INSERT INTO template_exercises (template_id, name, \"order\", default_reps, default_weight_kg) VALUES (v_template_id, 'Supino Reto com Barra', 1, 10, 60), (v_template_id, 'Supino Inclinado com Halteres', 2, 10, 24), (v_template_id, 'Crucifixo na Maquina', 3, 12, 40), (v_template_id, 'Triceps Corda', 4, 12, 15), (v_template_id, 'Triceps Testa', 5, 10, 20);
echo END $$; > temp-seed.sql

echo.
echo echo DO $$ > temp-seed-ana.sql
echo DECLARE v_user_id UUID := '%ANA_ID%'; v_workout_id UUID; v_exercise_id UUID; v_template_id UUID;
echo BEGIN
echo INSERT INTO workouts (name, user_id, date, notes) VALUES ('Superior A', v_user_id, CURRENT_DATE - INTERVAL '2 days', 'Foco em membros superiores') RETURNING id INTO v_workout_id;
echo INSERT INTO exercises (workout_id, name, \"order\") VALUES (v_workout_id, 'Puxada Frontal', 1) RETURNING id INTO v_exercise_id;
echo INSERT INTO workout_sets (exercise_id, set_number, reps, weight_kg, completed) VALUES (v_exercise_id, 1, 12, 35, true), (v_exercise_id, 2, 10, 40, true), (v_exercise_id, 3, 10, 40, true);
echo.
echo INSERT INTO workout_templates (name, user_id, description) VALUES ('Superior A - Membros Superiores', v_user_id, 'Foco em membros superiores') RETURNING id INTO v_template_id;
echo INSERT INTO template_exercises (template_id, name, \"order\", default_reps, default_weight_kg) VALUES (v_template_id, 'Puxada Frontal', 1, 12, 35), (v_template_id, 'Remada Sentada', 2, 12, 35), (v_template_id, 'Supino na Maquina', 3, 10, 30), (v_template_id, 'Desenvolvimento com Halteres', 4, 10, 8), (v_template_id, 'Elevacao Lateral', 5, 12, 4);
echo END $$; >> temp-seed-ana.sql

docker exec -i supabase_db_workout-app psql -U postgres -d postgres < temp-seed.sql
docker exec -i supabase_db_workout-app psql -U postgres -d postgres < temp-seed-ana.sql

del temp-seed.sql temp-seed-ana.sql

echo === Seed completo!
echo.
echo Dados inseridos:
docker exec -i supabase_db_workout-app psql -U postgres -d postgres -c "SELECT 'Templates: ' || count(*) FROM workout_templates; SELECT 'Workouts: ' || count(*) FROM workouts;"
