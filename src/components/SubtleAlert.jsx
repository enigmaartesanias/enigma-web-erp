import React, { useState, useEffect } from 'react';

export default function SubtleAlert({ message, duration = 8000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    if (!visible || !message) return null;

    return (
        <div className="mb-4 transition-opacity duration-500 ease-in-out">
            <p className="text-sm text-gray-600 text-center">
                {message}
            </p>
        </div>
    );
}
