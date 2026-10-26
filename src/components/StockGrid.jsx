import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * StockGrid: Piezas en taller con entrega inmediata — minimalista / joyería de autor
 * - Muestra un bloque fijo de 4 productos como máximo en el Index
 * - Sin botones de compra directos en las tarjetas (diseño tipo vitrina/galería)
 * - Grid 2 col en móvil (2x2) / 4 col en desktop (1x4)
 * - Se oculta automáticamente si no hay stock disponible (retorna null)
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

/* ── Badge de Oferta de Alta Gama (Fondo Obsidiana + Oro Fino) ── */
.sg-badge-oferta {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 2;
  background: rgba(18, 14, 11, 0.94);
  color: #e5c378;
  border: 1px solid rgba(212, 175, 55, 0.7);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 2px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sg-badge-oferta::before {
  content: '◆';
  font-size: 6px;
  color: #dfb76c;
  line-height: 1;
}

.sg-body{display:flex;flex-direction:column;flex:1;padding-top:12px;text-align:center;}
.sg-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:inherit;font-size:13px;font-weight:400;letter-spacing:.05em;line-height:1.4;color:#1a1a1a;text-decoration:none;transition:color .2s;}
.sg-title:hover{color:#777777;}
.sg-material{margin:4px 0 0;font-size:10px;font-weight:400;letter-spacing:.15em;text-transform:uppercase;color:#777777;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sg-stock{margin:2px 0 0;font-size:10px;font-weight:400;letter-spacing:.1em;text-transform:uppercase;color:#999999;line-height:1.3;white-space:nowrap;}

.sg-foot{margin-top:auto;padding-top:8px;}
.sg-price{display:flex;align-items:baseline;justify-content:center;gap:6px;line-height:1;}
.sg-price-now{font-size:13px;font-weight:400;color:#222222;}
.sg-price-old{font-size:11px;font-weight:300;color:#a3a3a3;text-decoration-line:line-through;text-decoration-color:#b0b0b0;text-decoration-thickness:1px;}
.sg-price-ask{font-size:12px;font-weight:300;color:#8a8a8a;}

/* Botón / enlace sutil para explorar todo el stock */
.sg-more-wrap{text-align:center;margin-top:32px;}
.sg-more-link{display:inline-flex;align-items:center;gap:8px;padding:9px 24px;border:1px solid #d4d4d4;border-radius:0;background:transparent;color:#333333;font-size:10px;font-weight:400;letter-spacing:.22em;text-indent:.1em;text-transform:uppercase;text-decoration:none;transition:all .3s ease;}
.sg-more-link:hover{border-color:#1a1a1a;background:#1a1a1a;color:#ffffff;}
.sg-more-link svg{transition:transform .3s ease;}
.sg-more-link:hover svg{transform:translateX(3px);}

@media (min-width:640px){
  .sg-wrap{padding:0 24px;}
  .sg-grid{gap:30px 20px;}
  .sg-title{font-size:14px;}
  .sg-price-now{font-size:14px;}
  .sg-badge-oferta{top:11px;left:11px;font-size:9px;padding:4px 9px;}
}
@media (min-width:768px){
  .sg-section{padding:56px 0 64px;}
  .sg-head{margin-bottom:36px;}
  .sg-grid{grid-template-columns:repeat(4,minmax(0,1fr));}
  .sg-more-wrap{margin-top:42px;}
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
                    .order('id', { ascending: false })
                    .limit(4);

                if (error) throw error;
                setProductos((data || []).slice(0, 4));
            } catch (err) {
                console.error('Error al cargar productos en stock inmediato:', err.message);
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStockProducts();
    }, []);

    if (loading || productos.length === 0) return null;

    // Helper material visible
    const getMaterialText = (prod) => {
        if (prod.material && prod.material.trim() !== '') return prod.material;
        if (prod.producto_material && prod.producto_material.length > 0) {
            return prod.producto_material[0]?.materiales?.nombre || '';
        }
        return prod.categorias?.nombre || '';
    };

    // Helper stock visible
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

                {/* ── Grid ── */}
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
                                {/* ── Imagen con enlace al detalle ── */}
                                <div className="sg-media" style={{ paddingBottom: IMAGE_PADDING }}>
                                    {tieneOferta && (
                                        <div className="sg-badge-oferta">
                                            Oferta
                                        </div>
                                    )}

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
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* ── Enlace sutil minimalista para ver todo el stock ── */}
                <div className="sg-more-wrap">
                    <Link to="/stock" className="sg-more-link" title="Ver catálogo completo de piezas en stock">
                        <span>Ver todas las piezas en stock</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default StockGrid;