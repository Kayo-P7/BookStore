import React from 'react';

// componente de paginacao estruturada no padrao shadcn alinhado a direita
export function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalItems <= pageSize && currentPage === 1) return null;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, currentPage * pageSize);

    return (
        <div className="pagination-container">
            <span className="pagination-info">
                Mostrando <strong>{startItem}–{endItem}</strong> de <strong>{totalItems}</strong> • Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <div className="pagination-actions">
                <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="Primeira página"
                >
                    «
                </button>
                <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Página anterior"
                >
                    ‹
                </button>

                <span className="pagination-current-pill">
                    {currentPage}
                </span>

                <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Próxima página"
                >
                    ›
                </button>
                <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Última página"
                >
                    »
                </button>
            </div>
        </div>
    );
}
