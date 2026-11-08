-- migracao flyway v2: adiciona indicador de primeiro acesso e troca obrigatoria de senha
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
