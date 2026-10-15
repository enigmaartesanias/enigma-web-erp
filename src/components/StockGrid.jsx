import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * StockGrid: Piezas en taller con entrega inmediata — minimalista / joyería de autor
 * - Grid 2 col móvil / 4 col desktop
 * - Oculto totalmente si no hay stock disponible (retorna null)
 * - Estilos propios (.sg-*) independientes de Tailwind
 */

// Proporción de la foto: '100%' = cuadrada 1:1 | '125%' = vertical 4:5
const IMAGE_PADDING = '100%';

const css = `
.sg-section{width:100%;padding:32px 0 36px;}
.sg-wrap{max-width:1024px;margin:0 auto;padding:0 16px;}
.sg-head{text-align:center;margin-bottom:24px;}
.sg-eyebrow{margin:0;font-size:11px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:#1a1a1a;line-height:1.4;}
.sg-rule{display:block;width:24px;height:1px;background:#d4d4d4;margin:10px auto;}
.sg-sub{margin:0 auto;max-width:300px;font-size:12px;font-weight:300;line-height:1.6;color:#8a8a8a;}

.sg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 12px;align-items:stretch;}
.sg-card{display:flex;flex-direction:column;height:100%;background:transparent;border:0;box-shadow:none;}

.sg-media{position:relative;width:100%;overflow:hidden;background:#f1efec;border-radius:0;}
.sg-media-link{position:absolute;top:0;left:0;right:0;bottom:0;display:block;}
.sg-img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:0;transition:transform .7s ease;}
.sg-card:hover .sg-img{transform:scale(1.04);}
.sg-noimg{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:300;color:#a3a3a3;}

.sg-body{display:flex;flex-direction:column;flex:1;padding-top:12px;text-align:center;}
/* Título ajustado: fuente limpia (sin serif rígida), tamaño equilibrado y capitalización natural */
.sg-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:inherit;font-size:13px;font-weight:400;letter-spacing:.05em;line-height:1.4;color:#1a1a1a;text-decoration:none;transition:color .2s;}
.sg-title:hover{color:#777777;}
.sg-material{margin:4px 0 0;font-size:10px;font-weight:400;letter-spacing:.15em;text-transform:uppercase;color:#777777;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sg-stock{margin:2px 0 0;font-size:10px;font-weight:400;letter-spacing:.1em;text-transform:uppercase;color:#999999;line-height:1.3;white-space:nowrap;}

.sg-foot{margin-top:auto;padding-top:8px;}
.sg-price{display:flex;align-items:baseline;justify-content:center;gap:6px;line-height:1;}
.sg-price-now{font-size:13px;font-weight:400;color:#222222;}
/* Tachado más sutil: gris discreto y línea fina en lugar de rojo invasivo */
.sg-price-old{font-size:11px;font-weight:300;color:#a3a3a3;text-decoration-line:line-through;text-decoration-color:#b0b0b0;text-decoration-thickness:1px;}
.sg-price-ask{font-size:12px;font-weight:300;color:#8a8a8a;}

/* Botón más corto, delicado, con borde gris suave */
.sg-btn{display:block;width:100%;max-width:105px;margin:12px auto 0;padding:5px 0;border:1px solid #d4d4d4;border-radius:0;background:transparent;color:#444444;font-size:9px;font-weight:400;letter-spacing:.2em;text-indent:.2em;text-transform:uppercase;text-align:center;text-decoration:none;transition:border-color .3s,color .3s,background-color .3s;}
.sg-btn:hover{border-color:#555555;background:#555555;color:#ffffff;}
.sg-btn:focus-visible{outline:1px solid #555555;outline-offset:2px;}

@media (min-width:640px){
  .sg-wrap{padding:0 24px;}
  .sg-grid{gap:30px 20px;}
  .sg-title{font-size:14px;}
  .sg-price-now{font-size:14px;}
}
@media (min-width:768px){
  .sg-section{padding:56px 0 64px;}
  .sg-head{margin-bottom:36px;}
  .sg-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
}
`;

const StockGrid = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStockProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('productos')
                    .select('*, categorias(nombre), producto_material(materiales(nombre))')
                    .eq('activo', true)
                    .eq('is_ready_to_ship', true)
                    .gt('stock_quantity', 0)
                    .order('orden', { ascending: true });

                if (error) throw error;
                setProductos(data || []);
            } catch (err) {
                console.error('Error al cargar productos en stock inmediato:', err.message);
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStockProducts();
    }, []);

    // 100% oculto si no hay piezas disponibles
    if (loading || productos.length === 0) return null;

    // Helper WhatsApp con mensaje prellenado
    const getWhatsAppUrl = (prod) => {
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '51960282376';
        const precio = prod.price_offer && Number(prod.price_offer) > 0 ? prod.price_offer : prod.precio;
        const precioStr = precio ? Number(precio).toFixed(2) : 'Consultar';
        const mensaje = `Hola Enigma, deseo comprar la pieza "${prod.titulo}" en Stock Inmediato (S/ ${precioStr}).`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    };

    // Helper material visible
    const getMaterialText = (prod) => {
        if (prod.material && prod.material.trim() !== '') return prod.material;
        if (prod.producto_material && prod.producto_material.length > 0) {
            return prod.producto_material[0]?.materiales?.nombre || '';
        }
        return prod.categorias?.nombre || '';
    };

    // Helper stock visible: "Stock: 1 UND" / "Stock: 6 UND"
    const getStockText = (prod) => {
        const qty = Number(prod.stock_quantity);
        if (!Number.isFinite(qty) || qty <= 0) return null;
        return `Stock: ${qty} UND`;
    };

    return (
        <section aria-label="Stock Inmediato en Taller" className="sg-section">
            <style>{css}</style>

            <div className="sg-wrap">

                {/* ── Encabezado ── */}
                <div className="sg-head">
                    <p className="sg-eyebrow">Disponibilidad Inmediata</p>
                    <span className="sg-rule" />
                    <p className="sg-sub">
                        Piezas forjadas a mano, listas para despacho inmediato.
                    </p>
                </div>

                {/* ── Grid 2 col móvil / 4 col desktop ── */}
                <div className="sg-grid">
                    {productos.map((producto) => {
                        const precioRegular = producto.precio !== null ? Number(producto.precio) : null;
                        const precioOferta = producto.price_offer !== null ? Number(producto.price_offer) : null;
                        const tieneOferta = precioOferta !== null && precioOferta > 0 && precioRegular !== null && precioOferta < precioRegular;
                        const material = getMaterialText(producto);
                        const precioVisible = tieneOferta ? precioOferta : precioRegular;
                        const stockText = getStockText(producto);

                        return (
                            <article key={producto.id} className="sg-card">

                                {/* ── Imagen ── */}
                                <div className="sg-media" style={{ paddingBottom: IMAGE_PADDING }}>
                                    <Link
                                        to={`/producto/${producto.id}`}
                                        title={`Ver ficha de ${producto.titulo}`}
                                        className="sg-media-link"
                                    >
                                        {producto.imagen_principal_url ? (
                                            <img
                                                src={producto.imagen_principal_url}
                                                alt={producto.titulo}
                                                loading="lazy"
                                                className="sg-img"
                                            />
                                        ) : (
                                            <div className="sg-noimg">Sin fotografía</div>
                                        )}
                                    </Link>
                                </div>

                                {/* ── Datos de la pieza ── */}
                                <div className="sg-body">
                                    <Link
                                        to={`/producto/${producto.id}`}
                                        title={producto.titulo}
                                        className="sg-title"
                                    >
                                        {producto.titulo}
                                    </Link>

                                    {material && <p className="sg-material">{material}</p>}
                                    {stockText && <p className="sg-stock">{stockText}</p>}

                                    <div className="sg-foot">
                                        <div className="sg-price">
                                            {precioVisible ? (
                                                <>
                                                    <span className="sg-price-now">S/ {precioVisible.toFixed(2)}</span>
                                                    {tieneOferta && (
                                                        <span className="sg-price-old">S/ {precioRegular.toFixed(2)}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="sg-price-ask">A pedido</span>
                                            )}
                                        </div>

                                        <a
                                            href={getWhatsAppUrl(producto)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Comprar ${producto.titulo} por WhatsApp`}
                                            aria-label={`Comprar ${producto.titulo} por WhatsApp`}
                                            className="sg-btn"
                                        >
                                            Comprar
                                        </a>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default StockGrid;