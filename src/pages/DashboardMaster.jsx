import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Settings, Package, LogOut, Download, Share2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SHARE = {
    title: 'Pulseras de Cobre - Enigma Artesanías',
    text: 'Pulseras de cobre hechas a mano — tejido artesanal, acabado natural.\n\nVer diseños:',
    url: 'https://artesaniasenigma.com/catalogo/Cobre/Pulsera',
};

// Colores con inline styles (Tailwind no los genera en este build)
const cards = [
    { label: 'Web', to: '/', icon: Store, bg: '#1e293b', fg: '#cbd5e1' },
    { label: 'Admin Web', to: '/admin', icon: Settings, bg: '#1e293b', fg: '#cbd5e1' },
    { label: 'ERP', to: '/inventario-home', icon: Package, bg: '#4f46e5', fg: '#c7d2fe' },
];

const cardStyle = (bg) => ({
    background: bg,
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px',
    cursor: 'pointer',
});

const labelStyle = {
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textAlign: 'center',
    lineHeight: 1.2,
};

const DashboardMaster = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((r) => {
            if (r.outcome === 'accepted') setDeferredPrompt(null);
        });
    };

    const handleShare = async () => {
        setSharing(true);
        try {
            if (navigator.share) {
                await navigator.share(SHARE);
            } else {
                await navigator.clipboard.writeText(`${SHARE.text}\n${SHARE.url}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 flex flex-col justify-between max-w-sm mx-auto">
            <div>
                <h1 className="text-center text-lg font-black tracking-[0.3em] text-slate-800 mb-6">
                    ENIGMA
                </h1>

                {/* Grid 2x2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {cards.map(({ label, to, icon: Icon, bg, fg }) => (
                        <button
                            key={label}
                            onClick={() => navigate(to)}
                            style={{ ...cardStyle(bg), aspectRatio: '1 / 1' }}
                            className="transition-transform duration-150 active:scale-95"
                        >
                            <Icon size={28} strokeWidth={1.6} style={{ color: fg }} />
                            <span style={labelStyle}>{label}</span>
                        </button>
                    ))}

                    {/* Cuarta tarjeta: compartir enlace */}
                    <button
                        onClick={handleShare}
                        disabled={sharing}
                        style={{ ...cardStyle('#059669'), aspectRatio: '1 / 1', opacity: sharing ? 0.5 : 1 }}
                        className="transition-transform duration-150 active:scale-95"
                    >
                        {copied
                            ? <Check size={28} strokeWidth={2} style={{ color: '#a7f3d0' }} />
                            : <Share2 size={28} strokeWidth={1.6} style={{ color: '#a7f3d0' }} />}
                        <span style={labelStyle}>Compartir enlace web</span>
                    </button>
                </div>

                {deferredPrompt && (
                    <button
                        onClick={handleInstall}
                        aria-label="Instalar app"
                        className="mt-3 w-full flex items-center justify-center bg-amber-400 text-amber-950 py-3 rounded-2xl shadow-sm transition-transform duration-150 active:scale-[0.98]"
                    >
                        <Download size={18} className="stroke-[2.2]" />
                    </button>
                )}
            </div>

            <button
                onClick={logout}
                aria-label="Cerrar sesión"
                className="mt-10 w-full flex items-center justify-center text-rose-500 bg-rose-50 py-2.5 rounded-xl border border-rose-100 active:scale-[0.98] transition-transform duration-150"
            >
                <LogOut size={16} className="stroke-[2.2]" />
            </button>
        </div>
    );
};

export default DashboardMaster;