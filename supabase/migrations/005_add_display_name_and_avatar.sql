-- Adicionar campo display_name para nome de exibição
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Adicionar campo avatar_url para foto de perfil
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- RLS policies para o bucket 'avatars' no Supabase Storage
-- Permitir upload apenas para o próprio avatar
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir update (overwrite) do próprio avatar
CREATE POLICY "Usuários podem atualizar o próprio avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir delete do próprio avatar
CREATE POLICY "Usuários podem deletar o próprio avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir leitura pública de avatares
CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
