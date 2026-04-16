-- Colunas de tempo de descanso (vindas de prod via feat/rest-time-per-exercise).
-- As colunas de exercício por tempo (exercise_type, duration_seconds, default_duration_seconds)
-- já foram adicionadas pela migration 009 e são mantidas aqui.

alter table "public"."exercises"
  add column if not exists "rest_seconds" integer not null default 60;

alter table "public"."template_exercises"
  add column if not exists "default_rest_seconds" integer not null default 60;


