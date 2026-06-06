import { onRequest } from "firebase-functions/v2/https";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    const descripcion = `Pieza personalizada hecha a pedido. ${precioTexto}.`;
    const urlRedirect = `https://artesaniasenigma.com/producto/${producto.id}`;

    // Intentar leer la plantilla index.html compilada local
    let template = '';
    try {
      const templatePath = path.join(__dirname, 'index.html');
      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf8');
      }
    } catch (e) {
      console.warn("No se pudo leer index.html local:", e);
    }

    if (!template) {
      // Plantilla de respaldo si no existe index.html
      template = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITULO}}</title>
    <meta name="description" content="{{DESCRIPCION}}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="{{TITULO}}" />
    <meta property="og:description" content="{{DESCRIPCION}}" />
    <meta property="og:image" content="{{IMAGEN}}" />
    <meta property="og:url" content="{{URL}}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{TITULO}}" />
    <meta name="twitter:description" content="{{DESCRIPCION}}" />
    <meta name="twitter:image" content="{{IMAGEN}}" />
</head>
<body>
    <script>
        window.location.replace("{{URL}}");
    </script>
    <p>Redirigiendo...</p>
</body>
</html>`;
      let html = template
        .replaceAll('{{TITULO}}', `${producto.titulo} | Enigma Joyería de Autor`)
        .replaceAll('{{DESCRIPCION}}', descripcion)
        .replaceAll('{{IMAGEN}}', producto.imagen_principal_url)
        .replaceAll('{{URL}}', urlRedirect);
      
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).send(html);
    }

    // Si existe la plantilla index.html, reemplazamos las metaetiquetas usando regex robusto
    let html = template;

    // 1. Título
    html = html.replace(/<title>.*?<\/title>/is, `<title>${producto.titulo} | Enigma Joyería de Autor</title>`);
    
    // 2. Metas de descripción
    html = html.replace(/<meta[^>]*?name="description"[^>]*?>/is, `<meta name="description" content="${descripcion}" />`);
    html = html.replace(/<meta[^>]*?property="og:description"[^>]*?>/is, `<meta property="og:description" content="${descripcion}" />`);
    html = html.replace(/<meta[^>]*?name="twitter:description"[^>]*?>/is, `<meta name="twitter:description" content="${descripcion}" />`);
    
    // 3. Metas de título
    html = html.replace(/<meta[^>]*?property="og:title"[^>]*?>/is, `<meta property="og:title" content="${producto.titulo} | Enigma Joyería de Autor" />`);
    html = html.replace(/<meta[^>]*?name="twitter:title"[^>]*?>/is, `<meta name="twitter:title" content="${producto.titulo} | Enigma Joyería de Autor" />`);

    // 4. Metas de imagen
    html = html.replace(/<meta[^>]*?property="og:image"[^>]*?>/is, `<meta property="og:image" content="${producto.imagen_principal_url}" />`);
    if (html.includes('name="twitter:image"')) {
      html = html.replace(/<meta[^>]*?name="twitter:image"[^>]*?>/is, `<meta name="twitter:image" content="${producto.imagen_principal_url}" />`);
    } else {
      html = html.replace('</head>', `<meta name="twitter:image" content="${producto.imagen_principal_url}" />\n</head>`);
    }

    // 5. Meta de URL
    html = html.replace(/<meta[^>]*?property="og:url"[^>]*?>/is, `<meta property="og:url" content="${urlRedirect}" />`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en la función shareProduct:", err);
    return res.status(500).send("Error interno del servidor");
  }
});
