import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Settings, Package, LogOut, Download, Share2, MapPin, FileText, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SHARE_DATA = {
    catalogo: {
        title: 'Pulseras de Cobre - Enigma Artesanías',
        text: 'Pulseras de cobre hechas a mano — tejido artesanal, acabado natural.\n\nVer diseños:',
        url: 'https://artesaniasenigma.com/catalogo/Cobre/Pulsera',
    },
    ubicacion: {
        title: 'Ubicación - Enigma Artesanías',
        text: 'Enigma Artesanías y Accesorios\nJr. Madre Selva 544 Tda. 02 - Urb. Santa Isabel - Carabayllo, Lima\n\nVe nuestra ubicación aquí:',
        url: 'https://artesaniasenigma.com/contacto',
    },
    politicas: {
        title: 'Políticas de Envío - Enigma',
        text: 'Envíos a todo el Perú — aquí nuestras tarifas y condiciones:',
        url: 'https://artesaniasenigma.com/politicasenvios',
    },
};

// Texto completo que se copia/comparte para cada key
const buildShareText = (key) => {
    const d = SHARE_DATA[key];
    return `${d.text}\n${d.url}`;
};

const DashboardMaster = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [sharing, setSharing] = useState(null);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        const handler = (e) => setDeferredPrompt(e);
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
            });
        }
    };

    const handleShare = async (key) => {
        const data = SHARE_DATA[key];
        setSharing(key);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: data.title,
                    text: data.text,
                    url: data.url,
                });
            } else {
                await navigator.clipboard.writeText(buildShareText(key));
                setCopied(key);
                setTimeout(() => setCopied(null), 2000);
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            setSharing(null);
        }
    };

    // NOTA: No usar clases dinámicas — Tailwind las purga. Cada botón tiene className estático.

    const shareItems = [
        {
            key: 'catalogo',
            label: 'Catálogo · Pulseras de cobre',
            sublabel: 'artesaniasenigma.com/catalogo/Cobre/Pulsera',
            icon: <Image size={15} className="stroke-[1.8]" />,
        },
        {
            key: 'ubicacion',
            label: 'Ubicación · Carabayllo',
            sublabel: 'artesaniasenigma.com/contacto',
            icon: <MapPin size={15} className="stroke-[1.8]" />,
        },
        {
            key: 'politicas',
            label: 'Políticas de envío',
            sublabel: 'artesaniasenigma.com/politicasenvios',
            icon: <FileText size={15} className="stroke-[1.8]" />,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 px-4 py-6 flex flex-col justify-between max-w-sm mx-auto">
            <div>
                {/* Header */}
                <header className="mb-5 text-center mt-2">
                    <p className="text-[9px] tracking-[0.25em] text-slate-400 uppercase font-black mb-1">Panel principal</p>
                    <h1 className="text-xl font-black tracking-wider text-slate-850">ENIGMA</h1>
                    <p className="text-[10.5px] text-slate-400 font-medium">Artesanías y Accesorios</p>
                </header>

                {/* Menú principal — inline styles para evitar purge de Tailwind */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.12)', transition: 'opacity .15s' }}
                        onMouseDown={e => e.currentTarget.style.opacity = '.85'}
                        onMouseUp={e => e.currentTarget.style.opacity = '1'}
                        onTouchStart={e => e.currentTarget.style.opacity = '.85'}
                        onTouchEnd={e => e.currentTarget.style.opacity = '1'}
                    >
                        <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '-0.01em' }}>Sitio Web</span>
                        <Store size={18} style={{ color: '#94a3b8' }} />
                    </button>

                    <button
                        onClick={() => navigate('/admin')}
                        style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.12)', transition: 'opacity .15s' }}
                        onMouseDown={e => e.currentTarget.style.opacity = '.85'}
                        onMouseUp={e => e.currentTarget.style.opacity = '1'}
                        onTouchStart={e => e.currentTarget.style.opacity = '.85'}
                        onTouchEnd={e => e.currentTarget.style.opacity = '1'}
                    >
                        <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '-0.01em' }}>Administración Web</span>
                        <Settings size={18} style={{ color: '#94a3b8' }} />
                    </button>

                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="bg-indigo-600 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-sm transition-all duration-200 active:scale-[0.985]"
                    >
                        <span className="font-bold text-xs tracking-tight">Sistema ERP</span>
                        <Package size={18} className="stroke-[1.8] text-indigo-200" />
                    </button>
                </div>

                {/* Instalar PWA - Más compacto */}
                {deferredPrompt && (
                    <div className="mt-2.5">
                        <button
                            onClick={handleInstall}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 w-full py-3 rounded-xl font-bold text-xs shadow-sm shadow-amber-100/50 transition-all duration-200 active:scale-[0.98]"
                        >
                            <Download size={15} className="stroke-[2.2]" /> Instalar app Enigma
                        </button>
                    </div>
                )}

                {/* Compartir con cliente - Más compacto */}
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Share2 size={11} className="text-slate-450 stroke-[2.2]" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em]">
                            Compartir con cliente
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {shareItems.map((item) => {
                            const isSharing = sharing === item.key;
                            const isCopied = copied === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleShare(item.key)}
                                    disabled={isSharing}
                                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white border border-gray-100 hover:border-slate-200/80 rounded-xl shadow-sm hover:shadow active:scale-[0.99] transition-all duration-200 disabled:opacity-50 min-w-0 text-left"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0 border border-slate-100/50">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 leading-tight">{item.label}</p>
                                            <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5 truncate">{item.sublabel}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all duration-150 flex-shrink-0 border ${
                                        isCopied
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/80'
                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100/40 hover:bg-indigo-100'
                                    }`}>
                                        {isSharing ? '...' : isCopied ? 'Copiado' : 'Enviar'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Nota de uso */}
                    <p className="text-[9.5px] text-slate-400 font-semibold text-center mt-3 leading-relaxed">
                        Toca "Enviar" → se abre WhatsApp con el mensaje listo.<br />
                        Si no, el texto se copia automáticamente.
                    </p>
                </div>
            </div>

            {/* Cerrar sesión - Más compacto */}
            <div className="mt-12">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 text-rose-500 hover:text-rose-600 font-bold text-xs bg-rose-50/50 hover:bg-rose-50 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.985] border border-rose-100/50"
                >
                    <LogOut size={14} className="stroke-[2.2]" /> Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default DashboardMaster;
