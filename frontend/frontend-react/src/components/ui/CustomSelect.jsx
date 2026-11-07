import React, { useEffect, useRef, useState } from 'react';

// componente de selecao customizado no padrao shadcn com fechamento ao clicar fora e esc
export function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Selecione uma opção',
    disabled = false,
    error = false,
    id
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    // fecha o dropdown com pointerdown em captura e tecla escape
    useEffect(() => {
        function handlePointerDown(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('pointerdown', handlePointerDown, true);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    function handleSelect(optionValue, isOptionDisabled) {
        if (isOptionDisabled) return;
        onChange(optionValue);
        setIsOpen(false);
    }

    return (
        <div
            ref={containerRef}
            className={`custom-select-container ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
            id={id}
        >
            <button
                type="button"
                className="custom-select-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`selected-label ${!selectedOption ? 'is-placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`select-chevron ${isOpen ? 'rotate' : ''}`}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <ul className="custom-select-dropdown animate-dropdown-fade" role="listbox">
                    {options.length === 0 ? (
                        <li className="select-empty-option">Nenhuma opção disponível</li>
                    ) : (
                        options.map(option => {
                            const isSelected = String(option.value) === String(value);
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`select-option ${isSelected ? 'is-selected' : ''} ${option.disabled ? 'is-disabled' : ''}`}
                                    onClick={() => handleSelect(option.value, option.disabled)}
                                >
                                    <span className="option-label">{option.label}</span>
                                    {isSelected && (
                                        <svg
                                            className="select-check"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}
