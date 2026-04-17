import React, { useState } from 'react';

/**
 * Tooltip elegante y sutil
 * @param {ReactNode} children - Elemento que activa el tooltip
 * @param {string} text - Texto a mostrar en el tooltip
 * @param {string} position - Posición: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
 * @param {number} delay - Delay antes de mostrar en ms (default: 300)
 * @param {boolean} disabled - Si está deshabilitado (default: false)
 */
const Tooltip = ({
    children,
    text,
    position = 'top',
    delay = 300,
    disabled = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const showTooltip = () => {
        if (disabled || !text) return;
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    // Posiciones del tooltip
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    // Posiciones de la flecha
    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            onClick={hideTooltip}
            onTouchStart={hideTooltip}
        >
            {children}

            {isVisible && text && (
                <div
                    className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${positionClasses[position]}`}
                    style={{ opacity: isVisible ? 0.95 : 0 }}
                >
                    {text}
                    {/* Flecha */}
                    <div
                        className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
                    />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
