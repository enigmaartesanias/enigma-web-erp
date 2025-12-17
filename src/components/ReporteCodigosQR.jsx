import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { stockDB } from '../utils/neonClient';
import { FaArrowLeft, FaPrint, FaSearch, FaBarcode } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReporteCodigosQR = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const printRef = useRef();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Cargamos solo productos por ahora para evitar errores con tablas no existentes
            const productosData = await productosExternosDB.getAll();

            // Mapeamos para enriquecer si hace falta, por ahora usamos productosExternosDB que es el principal
            // Ordenamos alfabéticamente
            const sorted = productosData.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setProductos(sorted);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        window.print();
    };

    const filteredProductos = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Header de navegación y acciones - OCULTO AL IMPRIMIR */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors text-gray-600"
                        title="Volver"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaBarcode className="text-indigo-600" />
                            Catálogo de Códigos QR
                        </h1>
                        <p className="text-sm text-gray-500">
                            {filteredProductos.length} productos listados
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={loading || filteredProductos.length === 0}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400"
                    >
                        <FaPrint />
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            {/* Área de Impresión / Visualización */}
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg min-h-[500px] print:shadow-none print:p-0">
                {loading ? (
                    <div className="flex justify-center items-center h-64 print:hidden">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredProductos.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 print:hidden">
                        No se encontraron productos que coincidan con tu búsqueda.
                    </div>
                ) : (
                    <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-white p-4 print:grid-cols-4 print:gap-4">
                        {filteredProductos.map((producto, index) => (
                            <div key={producto.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow bg-white page-break-inside-avoid print:shadow-none print:border-gray-300">
                                {/* Imagen del Producto */}
                                <div className="w-32 h-32 mb-3 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                                    {producto.imagen_url ? (
                                        <img
                                            src={producto.imagen_url}
                                            alt={producto.nombre}
                                            className="w-full h-full object-contain"
                                        // crossOrigin removido para evitar problemas de CORS en visualización
                                        />
                                    ) : (
                                        <span className="text-gray-300 text-xs">Sin imagen</span>
                                    )}
                                </div>

                                {/* Nombre */}
                                <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 h-10 w-full px-2">
                                    {producto.nombre}
                                </h3>

                                {/* Código QR */}
                                <div className="bg-white p-2 border border-gray-100 rounded mb-2">
                                    <QRCode
                                        value={producto.codigo_usuario || producto.id.toString()}
                                        size={80}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>

                                {/* Código Texto */}
                                <div className="bg-gray-100 px-2 py-1 rounded">
                                    <span className="font-mono text-xs font-bold text-gray-700 tracking-wider">
                                        {producto.codigo_usuario || 'S/N'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 10mm;
                    }
                    body {
                        background-color: white;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                    /* Forzar impresión de colores de fondo si es necesario, aunque chrome suele pedirlo en settings */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReporteCodigosQR;
