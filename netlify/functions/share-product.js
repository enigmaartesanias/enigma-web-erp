import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event) => {
    try {
        // Extraer el ID desde queryString o desde el path de la URL (/producto/206 o /api/share/product/206)
        let id = event.queryStringParameters && event.queryStringParameters.id;
        
        if (!id) {
            const pathParts = event.path.split('/').filter(Boolean);
            id = pathParts[pathParts.length - 1]; // Toma el último segmento de la URL
        }

        if (!id || id === 'producto' || id === 'product') {
            return {
                statusCode: 400,
                body: "Falta el ID del producto en la URL",
            };
        }

        // Consultar el producto en Supabase
        const { data: producto, error } = await supabase
            .from('productos')
            .select('id, titulo, precio, precio_local, imagen_principal_url')
            .eq('id', id)
            .single();

        if (error || !producto) {
            return {
                statusCode: 404,
                body: "Producto no encontrado",
            };
        }

        const precioMostrar = producto.precio_local || producto.precio || "a consultar";
        const precioTexto = isNaN(precioMostrar) ? "Precio a consultar" : `Desde S/. ${Number(precioMostrar).toFixed(2)} PEN`;
        
        const descripcion = `Pieza personalizada hecha a pedido. ${precioTexto}. Incluye env\u00edo internacional certificado para el extranjero.`;
        const urlRedirect = `https://artesaniasenigma.com/producto/${producto.id}`;

        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${producto.titulo} | Enigma Joyer\u00eda de Autor</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${producto.titulo} | Enigma Joyer\u00eda de Autor" />
    <meta property="og:description" content="${descripcion}" />
    <meta property="og:image" content="${producto.imagen_principal_url}" />
    <meta property="og:url" content="${urlRedirect}" />
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${producto.titulo} | Enigma Joyer\u00eda de Autor" />
    <meta name="twitter:description" content="${descripcion}" />
    <meta name="twitter:image" content="${producto.imagen_principal_url}" />

    <!-- Redirecci\u00f3n inmediata al Frontend React -->
    <script>
        window.location.replace("https://artesaniasenigma.com/producto/" + "${producto.id}" + "?ssr=1");
    </script>
</head>
<body>
    <p>Redirigiendo a la ficha del producto...</p>
    <p><a href="${urlRedirect}">Haz clic aquí si no eres redirigido automáticamente.</a></p>
</body>
</html>
        `;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "public, max-age=3600", // Cache por 1 hora
            },
            body: html,
        };

    } catch (err) {
        console.error("Error en la función share-product:", err);
        return {
            statusCode: 500,
            body: "Error interno del servidor",
        };
    }
};
