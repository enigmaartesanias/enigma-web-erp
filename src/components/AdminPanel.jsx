// src/components/AdminPanel.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Image, ShoppingBag, LogOut, ChevronRight, Star } from 'lucide-react';

import logo from '../assets/logo.png';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50/50">
        <div className="w-8 h-8 border-3 border-t-slate-800 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Redirigir si no hay usuario
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-gray-50/40 min-h-screen pb-16 flex flex-col justify-between">
      <div>
        {/* Logo Header */}
        <div className="flex justify-center pt-10 pb-6 bg-white border-b border-gray-100/80 shadow-sm">
          <Link to="/" className="transition-transform active:scale-98">
            <img src={logo} alt="Enigma Logo" className="h-10 object-contain hover:opacity-90 transition-opacity" />
          </Link>
        </div>

        {/* Header Text */}
        <header className="px-4 mb-8 mt-10 text-center max-w-md mx-auto">
          <p className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-black mb-1.5">Gestión de Contenido</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Panel de Administración</h1>
          {user && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10.5px] font-medium text-slate-500">
                Sesión: <span className="font-semibold text-slate-700">{user.email}</span>
              </p>
            </div>
          )}
        </header>

        {/* Main Grid */}
        <main className="container mx-auto px-4 max-w-md">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Carrusel */}
            <Link
              to="/admin/carrusel"
              className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-indigo-100">
                  <Image size={22} className="stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-slate-800 mb-0.5">Carrusel Principal</h2>
                  <p className="text-xs text-slate-400">Edita los banners promocionales de la web.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Productos */}
            <Link
              to="/admin/productos"
              className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-teal-100">
                  <ShoppingBag size={22} className="stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-slate-800 mb-0.5">Catálogo de Productos</h2>
                  <p className="text-xs text-slate-400">Gestiona precios, imágenes, stock y descripciones.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Colección Andru Donalds */}
            <Link
              to="/admin/andru-donalds"
              className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-amber-100">
                  <Star size={22} className="stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-slate-800 mb-0.5">Andru Donalds</h2>
                  <p className="text-xs text-slate-400">Gestiona las imágenes de la colección privada.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </Link>

          </div>
        </main>
      </div>

      {/* Botón de cierre de sesión */}
      <div className="flex justify-center px-4 mt-16 max-w-sm mx-auto w-full">
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100/85 text-rose-600 font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border border-rose-100 text-sm shadow-sm"
        >
          <LogOut size={16} className="stroke-[2.2]" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;