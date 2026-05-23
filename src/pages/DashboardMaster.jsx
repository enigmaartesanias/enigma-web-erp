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

    const menuItems = [
        { title: 'Sitio Web', path: '/', icon: <Store size={22} />, color: 'bg-indigo-600' },
        { title: 'Administración Web', path: '/admin', icon: <Settings size={22} />, color: 'bg-indigo-600' },
        { title: 'Sistema ERP', path: '/inventario-home', icon: <Package size={22} />, color: 'bg-indigo-600' },
    ];

    const shareItems = [
        {
            key: 'catalogo',
            label: 'Catálogo · Pulseras de cobre',
            sublabel: 'artesaniasenigma.com/catalogo/Cobre/Pulsera',
            icon: <Image size={18} />,
            color: 'border-amber-200 text-amber-900 bg-amber-50',
            iconColor: 'text-amber-600',
            dot: 'bg-amber-400',
        },
        {
            key: 'ubicacion',
            label: 'Ubicación · Carabayllo',
            sublabel: 'artesaniasenigma.com/contacto',
            icon: <MapPin size={18} />,
            color: 'border-teal-200 text-teal-900 bg-teal-50',
            iconColor: 'text-teal-600',
            dot: 'bg-teal-400',
        },
        {
            key: 'politicas',
            label: 'Políticas de envío',
            sublabel: 'artesaniasenigma.com/politicasenvios',
            icon: <FileText size={18} />,
            color: 'border-blue-200 text-blue-900 bg-blue-50',
            iconColor: 'text-blue-600',
            dot: 'bg-blue-400',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">

            {/* Header */}
            <header className="mb-8 text-center">
                <p className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-1">Panel principal</p>
                <h1 className="text-2xl font-bold tracking-wider text-gray-800">ENIGMA</h1>
                <p className="text-xs text-gray-400 mt-1">Artesanías y Accesorios</p>
            </header>

            {/* Menú principal */}
            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.title}
                        onClick={() => navigate(item.path)}
                        className={`${item.color} text-white px-5 py-4 rounded-xl shadow flex items-center justify-between transition-transform active:scale-95`}
                    >
                        <span className="font-semibold text-base">{item.title}</span>
                        {item.icon}
                    </button>
                ))}
            </div>

            {/* Instalar PWA */}
            {deferredPrompt && (
                <div className="max-w-sm mx-auto mt-3">
                    <button
                        onClick={handleInstall}
                        className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 w-full py-4 rounded-xl font-bold shadow"
                    >
                        <Download size={18} /> Instalar app Enigma
                    </button>
                </div>
            )}

            {/* Compartir con cliente */}
            <div className="max-w-sm mx-auto mt-9">
                <div className="flex items-center gap-2 mb-3">
                    <Share2 size={13} className="text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
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
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color} transition-transform active:scale-95 disabled:opacity-50`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={item.iconColor}>{item.icon}</span>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold leading-tight">{item.label}</p>
                                        <p className="text-[11px] opacity-50 mt-0.5 truncate max-w-[190px]">{item.sublabel}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold opacity-60 min-w-[40px] text-right">
                                    {isSharing ? '...' : isCopied ? 'Copiado' : 'Enviar'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Nota de uso */}
                <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                    Toca "Enviar" → se abre WhatsApp con el mensaje listo.<br />
                    Si no, el texto se copia automáticamente.
                </p>
            </div>

            {/* Cerrar sesión */}
            <button
                onClick={logout}
                className="mt-10 flex items-center justify-center gap-2 text-red-400 w-full max-w-sm mx-auto font-medium text-sm"
            >
                <LogOut size={16} /> Cerrar sesión
            </button>
        </div>
    );
};

export default DashboardMaster;
