import { useState, useEffect } from 'react';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';

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
        const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const impuesto = config.impuesto ? subtotal * config.impuestoTasa : 0;
        const descuento = parseFloat(config.descuento) || 0;
        const total = Math.max(0, subtotal + impuesto - descuento);

        setTotales({
            subtotal,
            impuesto,
            descuento,
            total,
            items: cart.reduce((acc, item) => acc + item.cantidad, 0)
        });
    }, [cart, config]);

    // Buscar y agregar producto por código
    const scanProduct = async (codigo) => {
        if (!codigo) return false;

        try {
            setLoadingProducto(true);
            const producto = await productosExternosDB.getByCodigo(codigo);

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

    // Agregar producto al carrito (manual o scanner)
    const addProductToCart = (producto) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id);
            if (existing) {
                // Si ya existe, aumentar cantidad
                return prev.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            } else {
                // Nuevo item
                return [...prev, {
                    id: producto.id,
                    codigo: producto.codigo_usuario,
                    nombre: producto.nombre,
                    imagen: producto.imagen_url,
                    precio: parseFloat(producto.precio),
                    cantidad: 1,
                    stockMax: producto.stock_actual,
                    categoria: producto.categoria
                }];
            }
        });
    };

    // Modificar cantidad
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                // Validar stock si se desea (opcional)
                // if (newQuantity > item.stockMax) return item;
                return { ...item, cantidad: newQuantity };
            }
            return item;
        }));
    };

    // Eliminar item
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    // Limpiar carrito
    const clearCart = () => {
        setCart([]);
        setConfig(prev => ({ ...prev, cliente: 'Cliente General', documento: '', descuento: 0 }));
    };

    return {
        cart,
        config,
        setConfig,
        totals: totales,
        loadingProducto,
        scanProduct,
        addProductToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };
};
