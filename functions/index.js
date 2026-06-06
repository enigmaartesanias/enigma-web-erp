import { onRequest } from "firebase-functions/v2/https";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwvhrtdddpmaovnyarhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw';

const supabase = createClient(supabaseUrl, supabaseKey);

export const shareProduct = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  try {
    // Extraer el ID desde query o desde el path
    let id = req.query.id;
    
    if (!id) {
      const pathParts = req.path.split('/').filter(Boolean);
      id = pathParts[pathParts.length - 1]; // Toma el último segmento
    }

    if (!id || id === 'producto' || id === 'product') {
      return res.status(400).send("Falta el ID del producto en la URL o es inválido");
    }

    // Consultar el producto en Supabase
    const { data: producto, error } = await supabase
      .from('productos')
      .select('id, titulo, precio, precio_local, imagen_principal_url')
      .eq('id', id)
      .single();

    if (error || !producto) {
      return res.status(404).send("Producto no encontrado");
    }

    const precioMostrar = producto.precio_local || producto.precio || "a consultar";
    const precioTexto = isNaN(precioMostrar) ? "Precio a consultar" : `Desde S/. ${Number(precioMostrar).toFixed(2)} PEN`;
    
    const descripcion = `Pieza personalizada hecha a pedido. ${precioTexto}. Incluye envío internacional certificado para el extranjero.`;
    const urlRedirect = `https://artesaniasenigma.com/producto/${producto.id}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${producto.titulo} | Enigma Joyería de Autor</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${producto.titulo} | Enigma Joyería de Autor" />
    <meta property="og:description" content="${descripcion}" />
    <meta property="og:image" content="${producto.imagen_principal_url}" />
    <meta property="og:url" content="${urlRedirect}" />
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${producto.titulo} | Enigma Joyería de Autor" />
    <meta name="twitter:description" content="${descripcion}" />
    <meta name="twitter:image" content="${producto.imagen_principal_url}" />

    <!-- Redirección inmediata al Frontend React -->
    <script>
        window.location.replace("https://artesaniasenigma.com/producto/" + "${producto.id}");
    </script>
</head>
<body>
    <p>Redirigiendo a la ficha del producto...</p>
    <p><a href="${urlRedirect}">Haz clic aquí si no eres redirigido automáticamente.</a></p>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en la función shareProduct:", err);
    return res.status(500).send("Error interno del servidor");
  }
});
