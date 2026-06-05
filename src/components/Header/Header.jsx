import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import youtubeIcon from '../../assets/youtube.ico';

/* ─────────────────────────────────────────
   Paleta Enigma — inline para evitar purge
   de Tailwind v2 sin JIT
───────────────────────────────────────── */
const C = {
    dorado:   '#c8964a',
    text:     '#1a1a1a',
    sub:      '#b09070',
    crema:    '#fdf9f5',
    bordes:   '#ede8e2',
    icCobre:  '#fdf0e0',
    icPlata:  '#f0f0f0',
    icAlpaca: '#eef4f0',
    textCobre:'#a07030',
    textAlp:  '#4a7a5a',
};

const groupLabel = {
    fontSize: 10, letterSpacing: '0.2em', fontWeight: 700,
    color: C.sub, textTransform: 'uppercase',
    marginBottom: 10, textAlign: 'left', display: 'block',
};

const jewelryByMaterial = {
    Cobre: [
        { name: 'Toda la Colección', path: '/cobre' },
        { name: 'Aretes',            path: '/catalogo/Cobre/ARETE' },
        { name: 'Pulseras',          path: '/catalogo/Cobre/PULSERA' },
        { name: 'Anillos',           path: '/catalogo/Cobre/ANILLO' },
        { name: 'Collares',          path: '/catalogo/Cobre/COLLAR' },
        { name: 'Vinchas / Tiaras',  path: '/catalogo/Cobre/VINCHA_TIARA' },
        { name: 'Tobilleras',        path: '/catalogo/Cobre/TOBILLERA' },
    ],
    Alpaca: [
        { name: 'Anillos',  path: '/catalogo/Alpaca/ANILLO' },
        { name: 'Pulseras', path: '/catalogo/Alpaca/PULSERA' },
        { name: 'Collares', path: '/catalogo/Alpaca/COLLAR' },
        { name: 'Aretes',   path: '/catalogo/Alpaca/ARETE' },
    ],
    Plata: [
        { name: 'Anillos',  path: '/catalogo/Plata/ANILLO' },
        { name: 'Pulseras', path: '/catalogo/Plata/PULSERA' },
        { name: 'Collares', path: '/catalogo/Plata/COLLAR' },
        { name: 'Aretes',   path: '/catalogo/Plata/ARETE' },
    ],
};

/* ─────────────────────────────────────────
   Componente Header
───────────────────────────────────────── */
const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen]             = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const openMenu  = () => setMenuOpen(true);
    const closeAll  = () => { setMenuOpen(false); setActiveDropdown(null); };
    const toggleMenu = () => setMenuOpen(o => !o);
    const toggleDropdown = (m) => setActiveDropdown(d => d === m ? null : m);

    /* Navegar y cerrar el drawer */
    const goTo = (path) => {
        closeAll();
        navigate(path);
    };

    /* Cerrar al hacer clic fuera del header + drawer */
    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e) => {
            const header = document.getElementById('main-header');
            const drawer = document.getElementById('mobile-menu-nav');
            if (
                header && !header.contains(e.target) &&
                drawer && !drawer.contains(e.target)
            ) {
                closeAll();
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [menuOpen]);

    /* Cerrar dropdown al clic fuera */
    useEffect(() => {
        if (!activeDropdown) return;
        const onDown = (e) => {
            const subs = document.querySelectorAll('.has-submenu');
            let inside = false;
            subs.forEach(li => { if (li.contains(e.target)) inside = true; });
            if (!inside) setActiveDropdown(null);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [activeDropdown]);

    /* ── Fila de metal con submenú ── */
    const MetalRow = ({ symbol, label, sub, iconBg, iconColor, metal }) => {
        const open = activeDropdown === metal;
        return (
            <div className="has-submenu">
                <button
                    onClick={() => toggleDropdown(metal)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '12px 0', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            backgroundColor: iconBg, color: iconColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 13,
                        }}>
                            {symbol}
                        </div>
                        <div>
                            <span style={{ display: 'block', fontWeight: 500, fontSize: 16, color: C.text }}>{label}</span>
                            <span style={{ display: 'block', fontSize: 12, color: C.sub }}>{sub}</span>
                        </div>
                    </div>
                    <span style={{
                        color: C.sub, fontSize: 20, lineHeight: 1,
                        display: 'inline-block',
                        transform: open ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                    }}>›</span>
                </button>

                {open && (
                    <ul style={{
                        marginLeft: 14, paddingLeft: 10, listStyle: 'none',
                        borderLeft: metal === 'Cobre' ? `2px solid ${C.dorado}` : `2px solid ${C.bordes}`,
                        backgroundColor: metal === 'Cobre' ? C.crema : '#fafaf8',
                        borderRadius: '0 8px 8px 0',
                        padding: '4px 0 6px 10px',
                        marginBottom: 6,
                    }}>
                        {jewelryByMaterial[metal].map(j => {
                            const isToda = j.name === 'Toda la Colección';
                            const isNew  = j.name.includes('Vinchas') || j.name.includes('Tobilleras');
                            return (
                                <li key={j.name}>
                                    <button
                                        onClick={() => goTo(j.path)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            width: '100%', padding: '8px 10px 8px 0',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: 15, textAlign: 'left',
                                            color: isToda ? C.dorado : '#555',
                                            fontWeight: isToda ? 600 : 400,
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                                                backgroundColor: isToda ? C.dorado : '#bbb',
                                                display: 'inline-block',
                                            }} />
                                            {j.name}
                                        </span>
                                        {isNew && (
                                            <span style={{
                                                fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
                                                backgroundColor: C.icCobre, color: C.textCobre,
                                                padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                                            }}>nuevo</span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    /* ── Fila de servicio / nosotros (botón que navega) ── */
    const NavRow = ({ path, iconBg, iconColor, iconContent, label, sub, hasDivider = true }) => (
        <div style={hasDivider ? { borderBottom: `1px solid ${C.bordes}` } : {}}>
            <button
                onClick={() => goTo(path)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '12px 0', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        backgroundColor: iconBg, color: iconColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 16,
                    }}>
                        {iconContent}
                    </div>
                    <div>
                        <span style={{ display: 'block', fontWeight: 500, fontSize: 16, color: C.text }}>{label}</span>
                        <span style={{ display: 'block', fontSize: 12, color: C.sub }}>{sub}</span>
                    </div>
                </div>
                <span style={{ color: C.sub, fontSize: 20, lineHeight: 1 }}>›</span>
            </button>
        </div>
    );

    return (
        <>
            {/* ── Media queries para ocultar elementos mobile/desktop ── */}
            <style>{`
                @media (min-width: 768px) {
                    #hamburger-btn  { display: none !important; }
                    #mobile-menu-nav { display: none !important; }
                    #menu-overlay    { display: none !important; }
                }
                @media (max-width: 767px) {
                    #desktop-nav { display: none !important; }
                }
            `}</style>

            {/* ══════════ HEADER BAR ══════════ */}
            <header
                id="main-header"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 64, zIndex: 100,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                {/* Logo */}
                <button onClick={() => goTo('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="Enigma artesanías" style={{ height: 40, display: 'block' }} />
                </button>

                {/* Botón hamburguesa — solo mobile (controlado por CSS) */}
                <button
                    id="hamburger-btn"
                    onClick={toggleMenu}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        width: 40, height: 40,
                        backgroundColor: '#111111',
                        borderRadius: 8, border: 'none',
                        cursor: 'pointer', gap: 5, padding: '10px 8px',
                    }}
                >
                    <span style={{
                        display: 'block', height: 2, width: '100%',
                        backgroundColor: '#fff', borderRadius: 2,
                        transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                        transition: 'transform 0.25s ease',
                    }} />
                    <span style={{
                        display: 'block', height: 2, width: '100%',
                        backgroundColor: '#fff', borderRadius: 2,
                        opacity: menuOpen ? 0 : 1,
                        transition: 'opacity 0.2s ease',
                    }} />
                    <span style={{
                        display: 'block', height: 2,
                        width: menuOpen ? '100%' : '60%',
                        alignSelf: 'flex-end',
                        backgroundColor: '#fff', borderRadius: 2,
                        transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                        transition: 'transform 0.25s ease, width 0.2s ease',
                    }} />
                </button>

                {/* Menú desktop — solo desktop (controlado por CSS) */}
                <ul id="desktop-nav" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
                    <li>
                        <Link to="/sobremi" style={{ display: 'block', padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#888'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}>
                            Sobre mí
                        </Link>
                    </li>
                    {['Cobre', 'Alpaca', 'Plata'].map(material => (
                        <li key={material} className="has-submenu" style={{ position: 'relative' }}
                            onMouseEnter={() => openMenu && setActiveDropdown(material)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button
                                style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer' }}
                                onClick={() => toggleDropdown(material)}
                            >
                                {material}
                            </button>
                            {activeDropdown === material && (
                                <ul style={{
                                    position: 'absolute', top: '100%', left: 0,
                                    backgroundColor: '#fff', border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                    minWidth: 180, listStyle: 'none', margin: 0, padding: '6px 0',
                                    zIndex: 200,
                                }}>
                                    {jewelryByMaterial[material].map(j => (
                                        <li key={j.name}>
                                            <Link
                                                to={j.path}
                                                onClick={() => setActiveDropdown(null)}
                                                style={{
                                                    display: 'block', padding: '8px 16px',
                                                    fontSize: 14, textDecoration: 'none',
                                                    fontWeight: j.name === 'Toda la Colección' ? 600 : 400,
                                                    color: j.name === 'Toda la Colección' ? C.dorado : '#374151',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fdf9f2'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                {j.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                    <li>
                        <Link to="/catalogo/all/PERSONALIZADO" onClick={() => setActiveDropdown(null)}
                            style={{ display: 'block', padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#888'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}>
                            Personalizados
                        </Link>
                    </li>
                    <li>
                        <Link to="/videoshorts" onClick={() => setActiveDropdown(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#888'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}>
                            <img src={youtubeIcon} alt="YouTube" style={{ width: 16, height: 16 }} />
                            Videos Shorts
                        </Link>
                    </li>
                    <li>
                        <Link to="/contacto" onClick={() => setActiveDropdown(null)}
                            style={{ display: 'block', padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#888'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}>
                            Contacto
                        </Link>
                    </li>
                </ul>
            </header>

            {/* ══════════════════════════════════════════════
                OVERLAY — cierra el drawer al clic fuera
            ══════════════════════════════════════════════ */}
            {menuOpen && (
                <div
                    id="menu-overlay"
                    onClick={closeAll}
                    style={{
                        position: 'fixed', inset: 0,
                        zIndex: 98,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                />
            )}

            {/* ══════════════════════════════════════════════
                DRAWER MÓVIL
                FUERA del <header> → sin conflicto de
                stacking context → links y scroll funcionan
            ══════════════════════════════════════════════ */}
            <nav
                id="mobile-menu-nav"
                style={{
                    position: 'fixed',
                    top: 64, left: 0, right: 0, bottom: 0,
                    zIndex: 99,
                    display: 'flex', flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
                }}
            >
                {/* Cuerpo scrolleable (flex:1 + overflowY:auto) */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    padding: '16px 20px',
                }}>
                    {/* COLECCIONES */}
                    <span style={groupLabel}>Colecciones</span>

                    <div style={{ borderBottom: `1px solid ${C.bordes}` }}>
                        <MetalRow symbol="Cu" label="Cobre" sub="6 categorías disponibles"
                            iconBg={C.icCobre} iconColor={C.textCobre} metal="Cobre" />
                    </div>
                    <div style={{ borderBottom: `1px solid ${C.bordes}` }}>
                        <MetalRow symbol="Al" label="Alpaca" sub="Anillos · Pulseras · Collares · Aretes"
                            iconBg={C.icAlpaca} iconColor={C.textAlp} metal="Alpaca" />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <MetalRow symbol="Ag" label="Plata" sub="Anillos · Pulseras · Collares · Aretes"
                            iconBg={C.icPlata} iconColor="#666" metal="Plata" />
                    </div>

                    {/* SERVICIOS */}
                    <div style={{ borderTop: `1px solid ${C.bordes}`, paddingTop: 16, marginBottom: 20 }}>
                        <span style={groupLabel}>Servicios</span>
                        <NavRow
                            path="/catalogo/all/PERSONALIZADO"
                            iconBg="#e8f0f8" iconColor="#4a6b82" iconContent="+"
                            label="Personalizados" sub="Diseña tu pieza única"
                        />
                        <NavRow
                            path="/videoshorts"
                            iconBg="#fce8e8" iconColor="#e53e3e"
                            iconContent={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                            label="Videos Shorts" sub="Proceso y técnicas"
                            hasDivider={false}
                        />
                    </div>

                    {/* NOSOTROS */}
                    <div style={{ borderTop: `1px solid ${C.bordes}`, paddingTop: 16, marginBottom: 8 }}>
                        <span style={groupLabel}>Nosotros</span>
                        <NavRow
                            path="/sobremi"
                            iconBg="#f0ece8" iconColor="#888" iconContent="—"
                            label="Sobre mí" sub="Historia del taller"
                        />
                        <NavRow
                            path="/contacto"
                            iconBg="#f0f0f0" iconColor="#666" iconContent="@"
                            label="Contacto" sub="WhatsApp · Redes"
                            hasDivider={false}
                        />
                    </div>

                    {/* Footer del drawer */}
                    <div style={{
                        borderTop: `1px solid ${C.bordes}`,
                        margin: '12px -20px 0',
                        padding: '12px 20px',
                        backgroundColor: C.crema,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.dorado, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 10, color: C.sub, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                            artesaniasenigma.com · Lima, Perú
                        </span>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;