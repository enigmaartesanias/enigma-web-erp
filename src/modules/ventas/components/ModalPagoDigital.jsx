import React from 'react';
import { FaMobileAlt, FaUniversity } from 'react-icons/fa';

const ModalPagoDigital = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const opcionesPago = [
        { id: 'Yape', label: 'YAPE', color: '#7c3aed', icon: FaMobileAlt },
        { id: 'Plin', label: 'PLIN', color: '#3b82f6', icon: FaMobileAlt },
        { id: 'Transferencia', label: 'TRANSF', color: '#059669', icon: FaUniversity }
    ];

    const handleSelect = (id) => {
        onSelect(id);
        onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    backgroundColor: '#1f2937',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: '900',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Método Digital
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            lineHeight: '1'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Opciones en FILAS (Grid Horizontal) */}
                <div style={{ padding: '24px' }}>
                    <p style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginBottom: '16px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                    }}>
                        Selecciona un método de pago
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                    }}>
                        {opcionesPago.map((opcion) => {
                            const Icon = opcion.icon;
                            return (
                                <button
                                    key={opcion.id}
                                    onClick={() => handleSelect(opcion.id)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '20px 12px',
                                        borderRadius: '16px',
                                        backgroundColor: opcion.color,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <Icon style={{ color: '#ffffff' }} size={22} />
                                    </div>
                                    <span style={{
                                        color: '#ffffff',
                                        fontWeight: '900',
                                        fontSize: '11px',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {opcion.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPagoDigital;
