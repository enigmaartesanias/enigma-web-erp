// src/components/AdminPanel.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import logo from '../assets/logo.png';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
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
    <div className="bg-gray-50 min-h-screen">
      {/* Logo Header */}
      <div className="flex justify-center pt-8 bg-gray-50">
        <img src={logo} alt="Logo" className="h-10 object-contain" />
      </div>

      {/* Header Text */}
      <header className="px-4 mb-4 mt-8">
        <h1 className="text-xl font-medium tracking-wide text-center text-gray-800 uppercase">Panel de Administración</h1>
        {user && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Sesión iniciada como: <span className="font-medium text-gray-700">{user.email}</span>
          </p>
        )}
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">

          {/* Carrusel */}
          <Link
            to="/admin/carrusel"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1">Carrusel</h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">Administra las imágenes del carrusel principal.</p>
          </Link>

          {/* Productos */}
          <Link
            to="/admin/productos"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6l-1-7z" />
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1">Productos</h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">Administra tus productos: imágenes, precios, materiales y más.</p>
          </Link>

          {/* Gestión de Stock */}
          <Link
            to="/admin/stock"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 1.343 3 3v5H9v-5c0-1.657 1.343-3 3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12h-4V8a7 7 0 00-14 0v4H3a1 1 0 00-1 1v6a1 1 0 001 1h18a1 1 0 001-1v-6a1 1 0 00-1-1z" />
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1">Gestión de Stock</h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">Administra el inventario de la tienda.</p>
          </Link>

          {/* Control de Pedidos */}
          <Link
            to="/admin/pedidos"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1">Pedidos</h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">Registra y controla los pedidos manuales.</p>
          </Link>

          {/* Reportes */}
          <Link
            to="/admin/reportes"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1">Reportes</h2>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">Visualiza estadísticas y exporta reportes en PDF.</p>
          </Link>
        </div>

        {/* Botón de cierre de sesión */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </main >
    </div >
  );
};

export default AdminPanel;