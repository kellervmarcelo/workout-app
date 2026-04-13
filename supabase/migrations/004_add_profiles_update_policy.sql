-- Add UPDATE policy for profiles table
-- This allows users to update their own profile (e.g., onboarding_completed flag)

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
