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
      .select('id, titulo, precio, precio_local, imagen_principal_url, descripcion')
      .eq('id', id)
      .single();

    if (error || !producto) {
      return res.status(404).send("Producto no encontrado");
    }

    const descRaw = producto.descripcion || '';
    const descripcion = descRaw
      .replace(/Desde\s+S\/\.?\s*[\d.,]+\s*PEN\.?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 150) || 'Pieza personalizada hecha a pedido. Joyería de autor | Enigma Artesanías.';
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
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en la función shareProduct:", err);
    return res.status(500).send("Error interno del servidor");
  }
});

export const shareCatalog = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  try {
    const pathParts = req.path.split('/').filter(Boolean);
    // Path looks like /catalogo/Cobre/Pulsera
    const materialUrl = pathParts.length > 1 ? pathParts[1] : 'all';
    const categoriaUrl = pathParts.length > 2 ? pathParts[2] : 'all';

    const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    const CATEGORY_PLURALS = {
      'collar': 'Collares',
      'anillo': 'Anillos',
      'arete': 'Aretes',
      'pulsera': 'Pulseras',
      'personalizado': 'Diseños personalizados',
      'vincha_tiara': 'Vinchas y Tiaras',
      'tobillera': 'Tobilleras'
    };

    const matDisplay = materialUrl === 'all' ? 'diversos materiales' : materialUrl.toLowerCase();
    
    let catDisplay = 'Joyas';
    let catLower = 'joyas';
    if (categoriaUrl !== 'all') {
       catDisplay = CATEGORY_PLURALS[categoriaUrl.toLowerCase()] || toTitleCase(categoriaUrl);
       catLower = catDisplay.toLowerCase();
    }

    let tituloOG = '';
    if (materialUrl !== 'all' && categoriaUrl !== 'all') {
       tituloOG = `${catDisplay} en ${toTitleCase(materialUrl)} | Orfebrería Enigma`;
    } else if (materialUrl !== 'all') {
       tituloOG = `Colección ${toTitleCase(materialUrl)} | Orfebrería Enigma`;
    } else if (categoriaUrl !== 'all') {
       tituloOG = `${catDisplay} | Orfebrería Enigma`;
    } else {
       tituloOG = `Catálogo de Joyas | Orfebrería Enigma`;
    }

    const descripcion = `Colección de ${catLower} de diseño forjadas a mano en ${matDisplay}. Explora nuestro portafolio de piezas de autor hechas a pedido.`;
    const urlRedirect = `https://artesaniasenigma.com${req.path}`;
    const imagen = "https://artesaniasenigma.com/logo2.png"; // Puedes cambiar a una imagen específica de catálogo

    // Leer la plantilla
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
      template = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITULO}}</title>
    <meta name="description" content="{{DESCRIPCION}}" />
    <meta property="og:type" content="website" />
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
    <script>window.location.replace("{{URL}}");</script>
</body>
</html>`;
      let html = template
        .replaceAll('{{TITULO}}', tituloOG)
        .replaceAll('{{DESCRIPCION}}', descripcion)
        .replaceAll('{{IMAGEN}}', imagen)
        .replaceAll('{{URL}}', urlRedirect);
      
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.status(200).send(html);
    }

    let html = template;
    html = html.replace(/<title>.*?<\/title>/is, `<title>${tituloOG}</title>`);
    html = html.replace(/<meta[^>]*?name="description"[^>]*?>/is, `<meta name="description" content="${descripcion}" />`);
    html = html.replace(/<meta[^>]*?property="og:description"[^>]*?>/is, `<meta property="og:description" content="${descripcion}" />`);
    html = html.replace(/<meta[^>]*?name="twitter:description"[^>]*?>/is, `<meta name="twitter:description" content="${descripcion}" />`);
    
    html = html.replace(/<meta[^>]*?property="og:title"[^>]*?>/is, `<meta property="og:title" content="${tituloOG}" />`);
    html = html.replace(/<meta[^>]*?name="twitter:title"[^>]*?>/is, `<meta name="twitter:title" content="${tituloOG}" />`);

    html = html.replace(/<meta[^>]*?property="og:image"[^>]*?>/is, `<meta property="og:image" content="${imagen}" />`);
    if (html.includes('name="twitter:image"')) {
      html = html.replace(/<meta[^>]*?name="twitter:image"[^>]*?>/is, `<meta name="twitter:image" content="${imagen}" />`);
    } else {
      html = html.replace('</head>', `<meta name="twitter:image" content="${imagen}" />\n</head>`);
    }

    html = html.replace(/<meta[^>]*?property="og:url"[^>]*?>/is, `<meta property="og:url" content="${urlRedirect}" />`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en shareCatalog:", err);
    return res.status(500).send("Error interno del servidor");
  }
});
