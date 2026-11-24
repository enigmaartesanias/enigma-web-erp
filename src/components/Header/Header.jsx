import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-blanco.png'; // PNG blanco con fondo transparente (ajusta el nombre si es otro)

/* ─────────────────────────────────────────
   Paleta Enigma — inline para evitar purge
   de Tailwind v2 sin JIT
───────────────────────────────────────── */
const C = {
    dorado: '#c8964a',
    text: '#1f1b18',
    sub: '#b09070',
    crema: '#fdf9f5',
    bordes: '#ede8e2',
    icCobre: '#fdf0e0',
    icPlata: '#f0f0f0',
    icAlpaca: '#eef4f0',
    textCobre: '#b56b38',
    textAlp: '#4a7a5a',
    textPlata: '#6e6e6e',
    marron: '#2a2018', // mismo tono de la sección Andru Donalds
};

/* Altura del header. Si en el celular lo ves muy pegado, sube a 76 u 80.
   Debe coincidir con la constante del hero si lo cambias. */
const HEADER_H = 76;

const MENU_FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const groupLabel = {
    fontSize: 10, letterSpacing: '0.2em', fontWeight: 600,
    color: C.sub, textTransform: 'uppercase',
    marginBottom: 6, textAlign: 'left', display: 'block',
    fontFamily: MENU_FONT,
};

const jewelryByMaterial = {
    Cobre: [
        { name: 'Aretes', path: '/catalogo/Cobre/ARETE' },
        { name: 'Pulseras', path: '/catalogo/Cobre/PULSERA' },
        { name: 'Anillos', path: '/catalogo/Cobre/ANILLO' },
        { name: 'Collares', path: '/catalogo/Cobre/COLLAR' },
        { name: 'Vinchas / Tiaras', path: '/catalogo/Cobre/VINCHA_TIARA' },
        { name: 'Tobilleras', path: '/catalogo/Cobre/TOBILLERA' },
    ],
    Alpaca: [
        { name: 'Anillos', path: '/catalogo/Alpaca/ANILLO' },
        { name: 'Pulseras', path: '/catalogo/Alpaca/PULSERA' },
        { name: 'Collares', path: '/catalogo/Alpaca/COLLAR' },
        { name: 'Aretes', path: '/catalogo/Alpaca/ARETE' },
    ],
    Plata: [
        { name: 'Anillos', path: '/catalogo/Plata/ANILLO' },
        { name: 'Pulseras', path: '/catalogo/Plata/PULSERA' },
        { name: 'Collares', path: '/catalogo/Plata/COLLAR' },
        { name: 'Aretes', path: '/catalogo/Plata/ARETE' },
    ],
};

const BanderaPeru = () => (
    <svg
        width="15"
        height="10"
        viewBox="0 0 18 12"
        aria-label="Bandera de Perú"
        style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            borderRadius: 1.5,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
            flexShrink: 0,
        }}
    >
        <rect x="0" y="0" width="6" height="12" fill="#d91023" />
        <rect x="6" y="0" width="6" height="12" fill="#ffffff" />
        <rect x="12" y="0" width="6" height="12" fill="#d91023" />
    </svg>
);

/* ─────────────────────────────────────────
   Componente Header
───────────────────────────────────────── */
const Header = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    const isHome = pathname === '/';

    const closeAll = () => { setMenuOpen(false); setActiveDropdown(null); };
    const toggleMenu = () => setMenuOpen(o => !o);
    const toggleDropdown = (m) => setActiveDropdown(d => d === m ? null : m);

    const goTo = (path) => {
        closeAll();
        navigate(path);
    };

    /* Transparente solo en el inicio, arriba del todo y con el menú cerrado.
       En cualquier otro caso, fondo marrón fijo. */
    const solid = !isHome || scrolled || menuOpen;

    /* Detectar scroll (solo importa en el inicio) */
    useEffect(() => {
        if (!isHome) { setScrolled(false); return; }
        const onScroll = () => setScrolled(window.scrollY > 60);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHome]);

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

    const MetalRow = ({ label, plusColor, metal }) => {
        const open = activeDropdown === metal;
        return (
            <div className="has-submenu">
                <button
                    onClick={() => toggleDropdown(metal)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '9px 0', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left', fontFamily: MENU_FONT,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                            aria-hidden
                            style={{
                                fontSize: 17,
                                fontWeight: 500,
                                lineHeight: 1,
                                color: plusColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 16,
                                transform: open ? 'rotate(45deg)' : 'none',
                                transition: 'transform 0.2s ease',
                            }}
                        >
                            +
                        </span>
                        <span style={{ fontWeight: 400, fontSize: 15, color: C.text, letterSpacing: '0.01em' }}>
                            {label}
                        </span>
                    </div>
                    <span style={{
                        color: C.sub, fontSize: 18, lineHeight: 1,
                        display: 'inline-block',
                        transform: open ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                    }}>›</span>
                </button>

                {open && (
                    <ul style={{
                        marginLeft: 10, listStyle: 'none',
                        borderLeft: metal === 'Cobre' ? `2px solid ${C.dorado}` : `2px solid ${C.bordes}`,
                        backgroundColor: metal === 'Cobre' ? C.crema : '#fafaf8',
                        borderRadius: '0 8px 8px 0',
                        padding: '3px 0 5px 10px',
                        marginBottom: 4,
                    }}>
                        {jewelryByMaterial[metal].map(j => (
                            <li key={j.name}>
                                <button
                                    onClick={() => goTo(j.path)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        width: '100%', padding: '6px 8px 6px 0',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 14, textAlign: 'left', fontFamily: MENU_FONT,
                                        color: '#555',
                                        fontWeight: 400,
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                                            backgroundColor: '#bbb',
                                            display: 'inline-block',
                                        }} />
                                        {j.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const NavRow = ({ path, label, hasDivider = true }) => (
        <div style={hasDivider ? { borderBottom: `1px solid ${C.bordes}` } : {}}>
            <button
                onClick={() => goTo(path)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '9px 0', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: MENU_FONT,
                }}
            >
                <span style={{ fontWeight: 400, fontSize: 15, color: C.text, letterSpacing: '0.01em' }}>
                    {label}
                </span>
                <span style={{ color: C.sub, fontSize: 18, lineHeight: 1 }}>›</span>
            </button>
        </div>
    );

    /* Estilo común de los enlaces del menú de escritorio (blancos sobre fondo transparente o marrón) */
    const navLink = {
        display: 'block', padding: '8px 12px', fontSize: 14,
        fontWeight: 500, color: '#ffffff', textDecoration: 'none',
    };

    return (
        <>
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
                    height: HEADER_H, zIndex: 100,
                    backgroundColor: solid ? C.marron : 'transparent',
                    boxShadow: solid ? '0 1px 8px rgba(0,0,0,0.25)' : 'none',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                <button onClick={() => goTo('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="Enigma artesanías" style={{ height: 54, display: 'block' }} />
                </button>

                <button
                    id="hamburger-btn"
                    onClick={toggleMenu}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        width: 40, height: 40,
                        backgroundColor: 'rgba(255,255,255,0.14)',
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

                {/* Nav Desktop */}
                <ul id="desktop-nav" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
                    <li>
                        <Link to="/el-oficio" style={navLink}>
                            El Oficio
                        </Link>
                    </li>
                    {['Cobre', 'Alpaca', 'Plata'].map(material => (
                        <li key={material} className="has-submenu" style={{ position: 'relative' }}
                            onMouseEnter={() => setActiveDropdown(material)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button style={{ padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer' }}>
                                {material}
                            </button>
                            {activeDropdown === material && (
                                <ul style={{
                                    position: 'absolute', top: '100%', left: 0,
                                    backgroundColor: '#fff', border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                    minWidth: 180, listStyle: 'none', margin: 0, padding: '6px 0',
                                    zIndex: 200,
                                }}>
                                    {jewelryByMaterial[material].map(j => (
                                        <li key={j.name}>
                                            <Link to={j.path} onClick={() => setActiveDropdown(null)} style={{ display: 'block', padding: '8px 16px', fontSize: 14, textDecoration: 'none', fontWeight: j.name === 'Toda la Colección' ? 600 : 400, color: j.name === 'Toda la Colección' ? C.dorado : '#374151' }}>
                                                {j.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                    <li>
                        <Link to="/catalogo/all/PERSONALIZADO" style={navLink}>
                            Personalizados
                        </Link>
                    </li>
                    <li>
                        <Link to="/contacto" style={navLink}>
                            Contacto
                        </Link>
                    </li>
                </ul>
            </header>

            {menuOpen && <div id="menu-overlay" onClick={closeAll} style={{ position: 'fixed', inset: 0, zIndex: 98, backgroundColor: 'rgba(0,0,0,0.15)' }} />}

            {/* BARRA DE NAVEGACIÓN MÓVIL (DRAWER) */}
            <nav
                id="mobile-menu-nav"
                style={{
                    position: 'fixed', top: HEADER_H, left: 0, right: 0, bottom: 0, zIndex: 99,
                    display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
                    fontFamily: MENU_FONT,
                }}
            >
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: '14px 20px' }}>

                    {/* ACCESO RÁPIDO: PIEZAS DISPONIBLES */}
                    <div style={{ borderBottom: `1px solid ${C.bordes}`, marginBottom: 14 }}>
                        <button
                            onClick={() => goTo('/stock')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', padding: '10px 0', background: 'none', border: 'none',
                                cursor: 'pointer', textAlign: 'left', fontFamily: MENU_FONT,
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span
                                    aria-hidden
                                    style={{
                                        display: 'inline-block', width: 6, height: 6,
                                        borderRadius: '50%', backgroundColor: C.dorado,
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ display: 'block' }}>
                                    <span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: C.text, letterSpacing: '0.01em' }}>
                                        Piezas disponibles
                                    </span>
                                    <span style={{ display: 'block', marginTop: 2, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.sub }}>
                                        Entrega inmediata
                                    </span>
                                </span>
                            </span>
                            <span aria-hidden style={{ color: C.dorado, fontSize: 18, lineHeight: 1 }}>›</span>
                        </button>
                    </div>

                    {/* COLECCIONES */}
                    <span style={groupLabel}>Colecciones</span>
                    <div style={{ borderBottom: `1px solid ${C.bordes}` }}>
                        <MetalRow label="Cobre" plusColor={C.textCobre} metal="Cobre" />
                    </div>
                    <div style={{ borderBottom: `1px solid ${C.bordes}` }}>
                        <MetalRow label="Alpaca" plusColor={C.textAlp} metal="Alpaca" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <MetalRow label="Plata" plusColor={C.textPlata} metal="Plata" />
                    </div>

                    {/* NOSOTROS */}
                    <div style={{ borderTop: `1px solid ${C.bordes}`, paddingTop: 12, marginBottom: 8 }}>
                        <span style={groupLabel}>Nosotros</span>
                        <NavRow path="/el-oficio" label="El Oficio" />
                        <NavRow path="/contacto" label="Contacto" hasDivider={false} />
                    </div>

                    {/* Footer del drawer */}
                    <div style={{ borderTop: `1px solid ${C.bordes}`, margin: '10px -20px 0', padding: '10px 20px', backgroundColor: C.crema, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BanderaPeru />
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