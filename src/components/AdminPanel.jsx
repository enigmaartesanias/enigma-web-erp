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
        <Link to="/">
          <img src={logo} alt="Logo" className="h-10 object-contain hover:opacity-80 transition-opacity" />
        </Link>
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
        {/* Grupo 1: Carrusel y Productos */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center">Gestión de Contenido</h3>
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
          </div>
        </div>


        {/* Grupo 4: Sistema de Inventario Integrado */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center">Sistema de Inventario</h3>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-8 max-w-md mx-auto">
            {/* Sistema de Inventario Integrado */}
            <Link
              to="/inventario-home"
              className="block p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border-2 border-indigo-200"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-base md:text-xl font-medium text-gray-900 mb-1">Sistema ERP Completo</h2>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block mb-2">Producción, Compras, Ventas, Inventario y más.</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                <span>✨ Integrado</span>
              </div>
            </Link>
          </div>
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