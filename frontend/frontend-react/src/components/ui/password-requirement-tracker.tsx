import * as React from 'react';
import { cn } from './button';

export interface PasswordRequirementTrackerProps {
    password?: string;
    className?: string;
}

export function getInputBorderState(password = ''): 'neutral' | 'red' | 'yellow' | 'green' {
    if (password.length === 0) return 'neutral';

    const upperCount = (password.match(/[A-Z]/g) || []).length;
    const numberCount = (password.match(/\d/g) || []).length;
    const specialCount = (password.match(/[^\w\d\s|_]/g) || []).length;

    const lengthState = password.length < 8 ? 'red' : password.length === 8 ? 'yellow' : 'green';
    const upperState = upperCount === 0 ? 'red' : upperCount === 1 ? 'yellow' : 'green';
    const numberState = numberCount === 0 ? 'red' : numberCount === 1 ? 'yellow' : 'green';
    const specialState = specialCount === 0 ? 'red' : specialCount === 1 ? 'yellow' : 'green';

    const hasAnyRed =
        lengthState === 'red' ||
        upperState === 'red' ||
        numberState === 'red' ||
        specialState === 'red';

    const greenCount = [
        lengthState === 'green',
        upperState === 'green',
        numberState === 'green',
        specialState === 'green'
    ].filter(Boolean).length;

    if (hasAnyRed) return 'red';
    if (greenCount >= 3) return 'green';
    return 'yellow';
}

export function PasswordRequirementTracker({
    password = '',
    className
}: PasswordRequirementTrackerProps) {
    const upperCount = (password.match(/[A-Z]/g) || []).length;
    const numberCount = (password.match(/\d/g) || []).length;
    const specialCount = (password.match(/[^\w\d\s|_]/g) || []).length;

    // Estados de cor individuais (neutral, red, yellow, green) no padrao wisis-front
    const lengthState: 'neutral' | 'red' | 'yellow' | 'green' =
        password.length === 0
            ? 'neutral'
            : password.length < 8
            ? 'red'
            : password.length === 8
            ? 'yellow'
            : 'green';

    const upperState: 'neutral' | 'red' | 'yellow' | 'green' =
        password.length === 0
            ? 'neutral'
            : upperCount === 0
            ? 'red'
            : upperCount === 1
            ? 'yellow'
            : 'green';

    const numberState: 'neutral' | 'red' | 'yellow' | 'green' =
        password.length === 0
            ? 'neutral'
            : numberCount === 0
            ? 'red'
            : numberCount === 1
            ? 'yellow'
            : 'green';

    const specialState: 'neutral' | 'red' | 'yellow' | 'green' =
        password.length === 0
            ? 'neutral'
            : specialCount === 0
            ? 'red'
            : specialCount === 1
            ? 'yellow'
            : 'green';

    const getRequirementClasses = (state: 'neutral' | 'red' | 'yellow' | 'green') => {
        switch (state) {
            case 'green':
                return 'font-semibold text-emerald-600';
            case 'yellow':
                return 'font-semibold text-amber-500';
            case 'red':
                return 'font-semibold text-rose-500';
            default:
                return 'font-medium text-[#171717]';
        }
    };

    return (
        <p className={cn('text-xs sm:text-sm leading-relaxed text-[#525252]', className)}>
            Crie uma senha forte, com{' '}
            <span
                className={cn(
                    'transition-colors duration-200',
                    getRequirementClasses(lengthState)
                )}
            >
                8 ou mais caracteres
            </span>
            , misture{' '}
            <span
                className={cn(
                    'transition-colors duration-200',
                    getRequirementClasses(upperState)
                )}
            >
                letras maiúsculas
            </span>
            ,{' '}
            <span
                className={cn(
                    'transition-colors duration-200',
                    getRequirementClasses(numberState)
                )}
            >
                números
            </span>{' '}
            e{' '}
            <span
                className={cn(
                    'transition-colors duration-200',
                    getRequirementClasses(specialState)
                )}
            >
                símbolos
            </span>
            .
        </p>
    );
}
