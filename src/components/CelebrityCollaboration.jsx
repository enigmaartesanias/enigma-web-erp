import andruDonalds from '../assets/images/andru.jpg';

const CelebrityCollaboration = () => {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #2e1a0a 0%, #3d2410 50%, #2e1a0a 100%)',
                padding: '2rem 1.5rem',
            }}
        >
            {/* Textura sutil */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(200,150,74,0.4) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            {/* Línea cobre superior */}
            <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, #c8964a, transparent)' }} />
            {/* Línea cobre inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, transparent, #c8964a, transparent)' }} />

            <div className="w-full max-w-3xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">

                    {/* ── Imagen ── */}
                    <div className="flex justify-center">
                        <div className="relative w-full" style={{ maxWidth: '260px' }}>
                            {/* Aro decorativo */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    border: '1px solid rgba(200,150,74,0.3)',
                                    transform: 'scale(1.025)',
                                    borderRadius: '10px',
                                }}
                            />
                            <img
                                src={andruDonalds}
                                alt="Andru Donalds luciendo joyas de Enigma Artesanías"
                                className="w-full object-cover object-center"
                                style={{
                                    aspectRatio: '4/5',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(200,150,74,0.4)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
                                    display: 'block',
                                }}
                            />
                            {/* Degradado inferior */}
                            <div
                                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                                style={{
                                    height: '35%',
                                    background: 'linear-gradient(to top, rgba(46,26,10,0.72) 0%, transparent 100%)',
                                    borderRadius: '0 0 8px 8px',
                                }}
                            />
                            {/* Badge Instagram */}
                            <a
                                href="https://www.instagram.com/andrudonalds/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'rgba(46,26,10,0.92)',
                                    border: '0.5px solid rgba(200,150,74,0.45)',
                                    color: '#f5f1ec',
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    fontSize: '9px',
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: '400',
                                    letterSpacing: '0.12em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    textDecoration: 'none',
                                }}
                            >
                                <span>Desde 2022</span>
                                <svg width="10" height="10" fill="#c8964a" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* ── Contenido ── */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'center',
                        padding: '0 8px',
                    }}>
                        {/* Eyebrow */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '9px',
                            fontWeight: '500',
                            letterSpacing: '0.26em',
                            textTransform: 'uppercase',
                            color: '#c8964a',
                            margin: 0,
                        }}>
                            Colaboración Exclusiva
                        </p>

                        {/* Línea decorativa */}
                        <div style={{
                            width: '20px',
                            height: '0.5px',
                            background: '#c8964a',
                            opacity: 0.6,
                        }} />

                        {/* Título */}
                        <h2 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(26px, 5vw, 34px)',
                            fontWeight: '300',
                            color: '#f5f1ec',
                            letterSpacing: '0.04em',
                            lineHeight: '1.2',
                            margin: 0,
                        }}>
                            Andru Donalds<br />
                            <span style={{ color: '#c8964a', fontStyle: 'italic' }}>&amp; Enigma</span>
                        </h2>

                        {/* Descripción */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '15px',
                            fontWeight: '300',
                            color: 'rgba(245,241,236,0.88)',
                            lineHeight: '1.75',
                            margin: 0,
                            maxWidth: '300px',
                            padding: '0 4px',
                        }}>
                            Desde 2022, cada pieza que luce este artista
                            internacional nace del mismo taller en Lima donde
                            forjamos el cobre vivo. Una colaboración de dos
                            nombres que comparten alma.
                        </p>

                        {/* Botón */}
                        <button
                            onClick={() => window.location.href = '/andru-donalds'}
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '10px',
                                fontWeight: '600',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: '#f5f1ec',
                                background: 'transparent',
                                border: '0.5px solid rgba(200,150,74,0.55)',
                                borderRadius: '2px',
                                padding: '11px 22px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '4px',
                                transition: 'border-color 0.2s, color 0.2s',
                                width: '100%',
                                maxWidth: '280px',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#c8964a';
                                e.currentTarget.style.color = '#c8964a';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(200,150,74,0.55)';
                                e.currentTarget.style.color = '#f5f1ec';
                            }}
                        >
                            Explorar la Colección Privada
                            <span style={{ fontSize: '11px' }}>›</span>
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CelebrityCollaboration;
