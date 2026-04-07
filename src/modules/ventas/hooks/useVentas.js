import { useState, useEffect } from 'react';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { toast } from 'react-hot-toast';

export const useVentas = () => {
    const [cart, setCart] = useState([]);
    const [loadingProducto, setLoadingProducto] = useState(false);

    // Configuración de venta
    const [config, setConfig] = useState({
        impuesto: false, // Aplicar IGV
        impuestoTasa: 0.18,
        descuento: 0,
        cliente: 'Cliente General',
        documento: ''
    });

    // Totales calculados
    const [totales, setTotales] = useState({
        subtotal: 0,
        impuesto: 0,
        descuento: 0,
        total: 0,
        items: 0
    });

    // Calcular totales cada vez que cambia el carrito o la configuración
    useEffect(() => {
        const subtotal = cart.reduce((acc, item) => {
            return acc + (parseFloat(item.precio_venta) * item.cantidad);
        }, 0);

        const impuesto = config.impuesto ? subtotal * config.impuestoTasa : 0;
        const descuentoGlobal = parseFloat(config.descuento) || 0;
        const total = Math.max(0, subtotal + impuesto - descuentoGlobal);

        setTotales({
            subtotal,
            impuesto,
            descuento: descuentoGlobal,
            total,
            items: cart.reduce((acc, item) => acc + item.cantidad, 0)
        });
    }, [cart, config]);

    // Buscar y agregar producto por código
    const scanProduct = async (codigo) => {
        if (!codigo) return false;

        try {
            setLoadingProducto(true);
            const producto = await productosExternosDB.getByCodigoConsolidated(codigo);

            if (producto) {
                addProductToCart(producto);
                return true;
            } else {
                return false; // No encontrado
            }
        } catch (error) {
            console.error("Error buscando producto:", error);
            return false;
        } finally {
            setLoadingProducto(false);
        }
    };

    const addProductToCart = (producto) => {
        const stockActual = parseInt(producto.stock_actual) || 0;
        
        if (stockActual <= 0) {
            toast.error(`"${producto.nombre}" no tiene stock disponible`, { position: 'bottom-center' });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id);
            if (existing) {
                if (existing.cantidad + 1 > stockActual) {
                    toast.error(`Stock máximo alcanzado (${stockActual} unid.)`, { position: 'bottom-center' });
                    return prev;
                }
                return prev.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            } else {
                const precioBase = parseFloat(producto.precio) || 0;
                const precioAlt = parseFloat(producto.precio_adicional) || null;

                let nombreLimpio = producto.nombre;
                if (producto.codigo_usuario && nombreLimpio.includes(producto.codigo_usuario)) {
                    nombreLimpio = nombreLimpio.replace(`- ${producto.codigo_usuario}`, '').replace(producto.codigo_usuario, '').trim();
                }

                return [...prev, {
                    id: producto.id,
                    codigo: producto.codigo_usuario,
                    nombre: nombreLimpio,
                    imagen: producto.imagen_url,
                    precio_base: precioBase,
                    precio_alternativo: precioAlt,
                    precio_venta: precioBase,
                    cantidad: 1,
                    stockMax: stockActual,
                    categoria: producto.categoria
                }];
            }
        });
    };

    const updateItem = (productId, changes) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const updated = { ...item, ...changes };
                
                // Control de stock en actualización
                if (updated.cantidad > item.stockMax) {
                    toast.error(`Solo hay ${item.stockMax} unidades disponibles`, { position: 'bottom-center' });
                    updated.cantidad = item.stockMax;
                }

                if (updated.cantidad < 1) updated.cantidad = 1;
                if (updated.precio_venta < 0) updated.precio_venta = 0;
                return updated;
            }
            return item;
        }));
    };

    const updateQuantity = (productId, newQuantity) => {
        updateItem(productId, { cantidad: newQuantity });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setConfig(prev => ({ ...prev, cliente: null, documento: '', descuento: 0 }));
    };

    return {
        cart,
        config,
        setConfig,
        totals: totales,
        loadingProducto,
        scanProduct,
        addProductToCart,
        updateItem,
        updateQuantity,
        removeFromCart,
        clearCart
    };
};
