-- adiciona indices para consultas de emprestimos por cliente, livro e status
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON tb_loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_id ON tb_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON tb_loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_customer_status ON tb_loans(customer_id, status);
