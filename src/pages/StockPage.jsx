import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const cssPage = `
.sp-badge-oferta {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 10;
  background: rgba(18, 14, 11, 0.94) !important;
  color: #e5c378 !important;
  border: 1px solid rgba(212, 175, 55, 0.8) !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 2px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sp-badge-oferta::before {
  content: '◆';
  font-size: 6px;
  color: #dfb76c;
  line-height: 1;
}
`;

const StockPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetal, setSelectedMetal] = useState('TODOS');

    useEffect(() => {
        document.title = 'Piezas en Stock Inmediato - Enigma Joyería Artesanal';

        const fetchStockProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: queryError } = await supabase
                    .from('productos')
                    .select('*, categorias(nombre), producto_material(materiales(nombre))')
                    .eq('activo', true)
                    .gt('stock_quantity', 0)
                    .order('id', { ascending: false });

                if (queryError) throw queryError;
                setProducts(data || []);
            } catch (err) {
                console.error('Error al cargar piezas en stock:', err);
                setError(err.message || 'No se pudieron cargar los productos en stock.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStockProducts();
    }, []);

    const getMaterialText = (prod) => {
        if (prod.material && prod.material.trim() !== '') return prod.material.trim();
        if (prod.producto_material && prod.producto_material.length > 0) {
            return prod.producto_material[0]?.materiales?.nombre || '';
        }
        return prod.categorias?.nombre || '';
    };

    const getStockQty = (prod) => {
        const qty = Number(prod.stock_quantity);
        return Number.isFinite(qty) && qty > 0 ? qty : null;
    };

    const getWhatsAppUrl = (prod) => {
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '51960282376';
        const precio = prod.price_offer && Number(prod.price_offer) > 0 ? prod.price_offer : prod.precio;
        const precioStr = precio ? Number(precio).toFixed(2) : 'Consultar';
        const mensaje = `Hola Enigma, deseo adquirir la pieza en Stock Inmediato "${prod.titulo}" (S/ ${precioStr}).`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    };

    const availableMetals = useMemo(() => {
        const set = new Set();
        products.forEach((p) => {
            const mat = getMaterialText(p);
            if (mat) {
                set.add(mat.toUpperCase());
            }
        });
        return ['TODOS', ...Array.from(set).sort()];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (selectedMetal === 'TODOS') return products;
        return products.filter((p) => {
            const mat = getMaterialText(p).toUpperCase();
            return mat === selectedMetal;
        });
    }, [products, selectedMetal]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-24 text-center min-h-[50vh] flex flex-col justify-center items-center">
                <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
                <p className="text-sm tracking-widest text-stone-500 uppercase">Cargando piezas en stock...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-light text-stone-900 mb-3">Error al cargar piezas</h1>
                <p className="text-sm text-stone-600 mb-6">{error}</p>
                <Link to="/" className="text-xs uppercase tracking-widest underline hover:text-stone-900">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
            <style>{cssPage}</style>

            {/* ── Top Bar ── */}
            <div className="flex justify-between items-end mb-6 md:mb-8 border-b border-gray-100 pb-3">
                <div className="text-xs md:text-sm text-gray-500 font-sans tracking-wide">
                    <Link to="/" className="hover:text-black transition-colors uppercase">INICIO</Link>
                    <span className="mx-2">/</span>
                    <span className="uppercase text-gray-900 font-medium">DISPONIBILIDAD INMEDIATA</span>
                </div>

                <div className="flex items-center">
                    <span className="text-xs md:text-sm text-gray-500 font-sans uppercase tracking-wider">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'Pieza disponible' : 'Piezas disponibles'}
                    </span>
                </div>
            </div>

            {/* ── Encabezado ── */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-gray-900 tracking-tight font-sans mb-3">
                    Piezas en Stock
                </h1>
                <p className="text-sm sm:text-base text-stone-600 font-light max-w-md mx-auto leading-relaxed">
                    Piezas forjadas a mano en el taller, listas para despacho y entrega inmediata.
                </p>
            </div>

            {/* ── Filtro por Metales ── */}
            {availableMetals.length > 2 && (
                <div className="w-full flex justify-center mb-10">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 px-2 border-b border-gray-200 pb-3">
                        {availableMetals.map((metal) => {
                            const isActive = selectedMetal === metal;
                            return (
                                <button
                                    key={metal}
                                    type="button"
                                    onClick={() => setSelectedMetal(metal)}
                                    className={`
                                        text-xs sm:text-sm font-bold transition-all duration-300 pb-1
                                        uppercase tracking-widest cursor-pointer
                                        ${isActive
                                            ? 'text-black border-b-2 border-black'
                                            : 'text-gray-400 hover:text-gray-800 border-b-2 border-transparent'}
                                    `}
                                >
                                    {metal}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Cuadrícula de Productos ── */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((producto) => {
                        const precioRegular = producto.precio !== null ? Number(producto.precio) : null;
                        const precioOferta = producto.price_offer !== null ? Number(producto.price_offer) : null;
                        const tieneOferta = precioOferta !== null && precioOferta > 0 && precioRegular !== null && precioOferta < precioRegular;
                        const precioVisible = tieneOferta ? precioOferta : precioRegular;
                        const material = getMaterialText(producto);
                        const stockQty = getStockQty(producto);

                        return (
                            <article
                                key={producto.id}
                                className="group bg-white border border-gray-200 hover:border-stone-400 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
                            >
                                {/* ── Imagen del Producto ── */}
                                <div className="aspect-[4/5] w-full overflow-hidden relative bg-[#f7f6f4]">
                                    {/* Badge Oferta idéntico al Index */}
                                    {tieneOferta && (
                                        <div className="sp-badge-oferta">
                                            Oferta
                                        </div>
                                    )}

                                    <Link
                                        to={`/producto/${producto.id}`}
                                        title={`Ver ficha de ${producto.titulo}`}
                                        className="block w-full h-full"
                                    >
                                        {producto.imagen_principal_url ? (
                                            <img
                                                src={producto.imagen_principal_url}
                                                alt={producto.titulo}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-light">
                                                Sin fotografía
                                            </div>
                                        )}
                                    </Link>
                                </div>

                                {/* ── Ficha del Producto ── */}
                                <div className="p-4 sm:p-5 flex flex-col flex-grow text-center">
                                    <Link
                                        to={`/producto/${producto.id}`}
                                        className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 hover:text-stone-600 transition-colors line-clamp-2 min-h-[44px] sm:min-h-[52px] tracking-wide leading-tight"
                                        title={producto.titulo}
                                    >
                                        {producto.titulo}
                                    </Link>

                                    {material && (
                                        <p className="mt-2 text-xs sm:text-sm uppercase tracking-widest text-stone-600 font-medium truncate">
                                            {material}
                                        </p>
                                    )}

                                    {stockQty && (
                                        <p className="mt-1 text-xs sm:text-sm uppercase tracking-wider text-stone-500 font-normal">
                                            Stock: {stockQty} UND
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4">
                                        <div className="flex items-baseline justify-center gap-2.5 mb-3">
                                            {precioVisible ? (
                                                <>
                                                    <span className="text-base sm:text-lg md:text-xl font-bold text-stone-900">
                                                        S/ {precioVisible.toFixed(2)}
                                                    </span>
                                                    {tieneOferta && (
                                                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                                                            S/ {precioRegular.toFixed(2)}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-500 font-light">A pedido</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5 pt-1">
                                            <a
                                                href={getWhatsAppUrl(producto)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Comprar ${producto.titulo} por WhatsApp`}
                                                className="block w-full py-2 sm:py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-stone-800 hover:text-white border border-stone-400 hover:border-stone-900 hover:bg-stone-900 transition-all duration-200 text-center"
                                            >
                                                Comprar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                    <p className="text-gray-500 text-sm tracking-wide">
                        No hay piezas con disponibilidad inmediata bajo el filtro seleccionado.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSelectedMetal('TODOS')}
                        className="text-xs uppercase tracking-widest underline text-stone-800 mt-3 inline-block font-medium cursor-pointer"
                    >
                        Ver todas las piezas en stock
                    </button>
                </div>
            )}
        </div>
    );
};

export default StockPage;