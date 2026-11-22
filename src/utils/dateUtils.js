
export const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convierte un valor ISO / YYYY-MM-DD a un Date en horario local,
 * evitando el desfase de un día que produce `new Date('YYYY-MM-DD')` (UTC).
 */
export const parseLocalDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    const str = String(value);
    const datePart = str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);

    if (year && month && day) {
        return new Date(year, month - 1, day);
    }

    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Devuelve YYYY-MM-DD (para <input type="date">) a partir de un valor de BD.
 */
export const toDateInputValue = (value) => {
    const date = parseLocalDate(value);
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha YYYY-MM-DD a timestamp local al mediodía.
 * Evita que al guardar/leer en UTC el día se corra al anterior.
 */
export const toTimestampNoon = (value) => {
    const datePart = toDateInputValue(value);
    return datePart ? `${datePart}T12:00:00` : null;
};
