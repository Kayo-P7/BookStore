CREATE TABLE tb_book_loan_inventory (
                                        id BIGSERIAL PRIMARY KEY,
                                        book_id BIGINT NOT NULL UNIQUE,
                                        total_copies INTEGER NOT NULL,
                                        available_copies INTEGER NOT NULL,
                                        borrowed_copies INTEGER NOT NULL,

                                        CONSTRAINT chk_inventory_quantities
                                            CHECK (
                                                total_copies >= 0
                                                    AND available_copies >= 0
                                                    AND borrowed_copies >= 0
                                                    AND total_copies = available_copies + borrowed_copies
                                                )
);

CREATE TABLE tb_loans (
                          id BIGSERIAL PRIMARY KEY,
                          book_id BIGINT NOT NULL,
                          customer_id BIGINT NOT NULL,
                          loan_date DATE NOT NULL,
                          due_date DATE NOT NULL,
                          return_date DATE,
                          status VARCHAR(20) NOT NULL
);