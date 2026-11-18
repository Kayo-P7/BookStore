-- remove indice duplicado em users(email), ja coberto pela constraint unique uk_users_email
DROP INDEX IF EXISTS idx_users_email;
