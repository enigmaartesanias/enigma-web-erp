import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Settings, Package, LogOut, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardMaster = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null);
                }
            });
        }
    };

    const menuItems = [
        { title: 'Tienda Online', path: '/', icon: <Store size={24} />, color: 'bg-indigo-600' },
        { title: 'Administración Web', path: '/admin', icon: <Settings size={24} />, color: 'bg-emerald-600' },
        { title: 'Sistema ERP', path: '/inventario-home', icon: <Package size={24} />, color: 'bg-blue-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">ENIGMA</h1>
            </header>

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

            {/* Este botón solo aparece si el navegador permite la instalación */}
            {deferredPrompt && (
                <button
                    onClick={handleInstall}
                    className="mt-8 flex items-center justify-center gap-2 bg-yellow-500 text-white w-full py-4 rounded-xl font-bold shadow-lg"
                >
                    <Download size={20} /> Instalar Sistema Enigma
                </button>
            )}

            <button
                onClick={logout}
                className="mt-12 flex items-center justify-center gap-2 text-red-500 w-full font-medium"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>
        </div>
    );
};

export default DashboardMaster;