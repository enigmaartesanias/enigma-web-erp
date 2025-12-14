import { useState } from 'react';
import sql from '../config/neonClient';

export default function Produccion() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        🔨 Producción
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Gestión del taller y fabricación de productos
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                            📋 <strong>Módulo de Producción</strong> - En construcción
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                            Este módulo mostrará las órdenes de producción pendientes y en proceso.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
