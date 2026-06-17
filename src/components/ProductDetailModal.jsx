import React from 'react';

const ProductDetailModal = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    return (
        <>
            {/* ── OVERLAY ── */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}
            >
                {/* ── MODAL CONTAINER ── */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '384px',         /* max-w-sm */
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#0d0d0d',
                        border: '1px solid rgba(200,150,74,0.30)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(200,150,74,0.08)',
                    }}
                >
                    {/* ── BOTÓN CERRAR ── */}
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        style={{
                            position: 'absolute',
                            top: '14px',
                            right: '14px',
                            zIndex: 10,
                            background: 'rgba(13,13,13,0.75)',
                            border: '0.5px solid rgba(200,150,74,0.25)',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#f5f1ec',
                            fontSize: '14px',
                            lineHeight: 1,
                            transition: 'color 0.2s, border-color 0.2s',
                            padding: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#c8964a';
                            e.currentTarget.style.borderColor = 'rgba(200,150,74,0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#f5f1ec';
                            e.currentTarget.style.borderColor = 'rgba(200,150,74,0.25)';
                        }}
                    >
                        ✕
                    </button>

                    {/* ── ÁREA IMAGEN (fluida, se adapta a la proporción real de la foto) ── */}
                    <div
                        style={{
                            background: '#1a1a1a',
                            padding: '16px 16px 0',
                            flexShrink: 0,
                        }}
                    >
                        {/* Marco decorativo — sigue exactamente la silueta de la foto */}
                        <div
                            style={{
                                border: '1px solid rgba(200,150,74,0.25)',
                                borderRadius: '6px 6px 0 0',
                                overflow: 'hidden',
                                width: '100%',
                            }}
                        >
                            <img
                                src={product.image}
                                alt={product.title || 'Pieza artesanal Enigma'}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── ÁREA TEXTO (overflow-y-auto) ── */}
                    <div
                        style={{
                            padding: '24px 24px 32px',
                            overflowY: 'auto',
                            flex: 1,
                        }}
                        className="modal-scroll"
                    >
                        {/* Eyebrow / Tag */}
                        {product.tag && (
                            <p
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    color: '#c8964a',
                                    margin: '0 0 6px',
                                }}
                            >
                                {product.tag}
                            </p>
                        )}

                        {/* Descripción */}
                        {product.description && (
                            <div
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '16px',
                                    fontWeight: 300,
                                    color: '#f5f1ec',
                                    lineHeight: 1.75,
                                    textAlign: 'left',
                                }}
                            >
                                {product.description.split('\n').map((paragraph, idx) =>
                                    paragraph.trim() ? (
                                        <p key={idx} style={{ margin: '0 0 16px' }}>
                                            {paragraph}
                                        </p>
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── LÍNEA INFERIOR DORADA ── */}
                    <div
                        style={{
                            height: '0.5px',
                            background: 'linear-gradient(to right, transparent, rgba(200,150,74,0.5), transparent)',
                            flexShrink: 0,
                        }}
                    />
                </div>
            </div>

            {/* ── ESTILOS GLOBALES ── */}
            <style>{`
                .modal-scroll::-webkit-scrollbar {
                    width: 3px;
                }
                .modal-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .modal-scroll::-webkit-scrollbar-thumb {
                    background: rgba(200,150,74,0.25);
                    border-radius: 2px;
                }
                .modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(200,150,74,0.5);
                }
                .modal-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(200,150,74,0.25) transparent;
                }
            `}</style>
        </>
    );
};

export default ProductDetailModal;
