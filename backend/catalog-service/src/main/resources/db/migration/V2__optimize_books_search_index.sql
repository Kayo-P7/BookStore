-- habilita busca textual por trigrama (ILIKE '%termo%') sem seq scan na tabela books
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'pg_trgm indisponivel sem permissao; mantendo indice funcional lower(title)';
END $$;

CREATE INDEX IF NOT EXISTS idx_books_title_lower ON books (LOWER(title));
