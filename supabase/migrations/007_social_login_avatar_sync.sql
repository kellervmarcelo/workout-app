-- Atualizar trigger para capturar avatar_url e display_name de OAuth (GitHub/Google)
-- GitHub usa 'avatar_url' e 'full_name', Google usa 'picture' e 'name' no raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extrair avatar_url do metadata de OAuth
    CASE
      WHEN NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'avatar_url'
      WHEN NEW.raw_user_meta_data->>'picture' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'picture'
      ELSE NULL
    END,
    -- Extrair display_name do metadata de OAuth
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- GitHub
      NEW.raw_user_meta_data->>'name',       -- Google
      NULL
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
