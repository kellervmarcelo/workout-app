-- Adiciona rastreamento do início do treino.
-- started_at é setado quando o primeiro set é marcado como concluído.
-- Duração = completed_at - started_at (calculada no cliente).
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
