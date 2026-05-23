import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Settings, Package, LogOut, Download, Share2, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SHARE_DATA = {
    catalogo: {
        title: 'Pulseras de Cobre - Enigma',
        text: '¡Hola! Te comparto nuestro catálogo de pulseras de cobre hechas a mano 🤎\n\nEncuéntralas aquí:',
        url: 'https://artesaniasenigma.com/catalogo/Cobre/Pulsera',
    },
    ubicacion: {
        title: 'Cómo llegar a Enigma Artesanías',
        text: '📍 Enigma Artesanías y Accesorios\nJr. Madre Selva 544 Tda. 02 - Urb. Santa Isabel - Carabayllo, Lima\n\nVe nuestra ubicación aquí:',
        url: 'https://artesaniasenigma.com/contacto',
    },
    politicas: {
        title: 'Políticas de Envío - Enigma',
        text: '📦 Aquí están nuestras políticas de envío y tarifas:',
        url: 'https://artesaniasenigma.com/politicasenvios',
    },
};

const DashboardMaster = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [sharing, setSharing] = useState(null);

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
                await navigator.share(data);
            } else {
                await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
                alert('Link copiado al portapapeles');
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            setSharing(null);
        }
    };

    const menuItems = [
        { title: 'Web', path: '/', icon: <Store size={24} />, color: 'bg-indigo-600' },
        { title: 'Administración Web', path: '/admin', icon: <Settings size={24} />, color: 'bg-indigo-600' },
        { title: 'Sistema ERP', path: '/inventario-home', icon: <Package size={24} />, color: 'bg-indigo-600' },
    ];

    const shareItems = [
        {
            key: 'catalogo',
            label: 'Catálogo Cobre',
            sublabel: 'Pulseras hechas a mano',
            icon: <Share2 size={18} />,
            color: 'border-amber-300 text-amber-800 bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            key: 'ubicacion',
            label: 'Ubicación',
            sublabel: 'Carabayllo, Lima',
            icon: <MapPin size={18} />,
            color: 'border-teal-300 text-teal-800 bg-teal-50',
            iconColor: 'text-teal-600',
        },
        {
            key: 'politicas',
            label: 'Políticas de Envío',
            sublabel: 'Tarifas y condiciones',
            icon: <FileText size={18} />,
            color: 'border-blue-300 text-blue-800 bg-blue-50',
            iconColor: 'text-blue-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">ENIGMA</h1>
            </header>

            {/* Menú principal */}
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.title}
                        onClick={() => navigate(item.path)}
                        className={`${item.color} text-white p-5 rounded-xl shadow-lg flex items-center justify-between transition-transform active:scale-95`}
                    >
                        <span className="font-semibold text-lg">{item.title}</span>
                        {item.icon}
                    </button>
                ))}
            </div>

            {/* Instalar PWA */}
            {deferredPrompt && (
                <div className="max-w-sm mx-auto mt-4">
                    <button
                        onClick={handleInstall}
                        className="flex items-center justify-center gap-2 bg-yellow-500 text-white w-full py-4 rounded-xl font-bold shadow-lg"
                    >
                        <Download size={20} /> Instalar Sistema Enigma
                    </button>
                </div>
            )}

            {/* Compartir con cliente */}
            <div className="max-w-sm mx-auto mt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
                    Compartir con cliente
                </p>
                <div className="flex flex-col gap-3">
                    {shareItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleShare(item.key)}
                            disabled={sharing === item.key}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color} transition-transform active:scale-95 disabled:opacity-60`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={item.iconColor}>{item.icon}</span>
                                <div className="text-left">
                                    <p className="text-sm font-semibold leading-tight">{item.label}</p>
                                    <p className="text-xs opacity-60">{item.sublabel}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold opacity-70">
                                {sharing === item.key ? '...' : 'Enviar'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cerrar sesión */}
            <button
                onClick={logout}
                className="mt-10 flex items-center justify-center gap-2 text-red-500 w-full max-w-sm mx-auto font-medium"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>
        </div>
    );
};

export default DashboardMaster;