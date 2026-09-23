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

// Helper function to build absolute URLs
const getAbsoluteUrl = (urlPath) => {
  if (!urlPath) return 'https://artesaniasenigma.com/logo2.png';
  if (urlPath.startsWith('http')) return urlPath;
  return `https://artesaniasenigma.com${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

// Helper function to get the base template
const getTemplate = () => {
  try {
    const templatePath = path.join(__dirname, 'index.html');
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
  } catch (e) {
    console.warn("No se pudo leer index.html local:", e);
  }
  return null;
};

// Helper function to inject OG tags into HTML
const injectMetaTags = (html, meta) => {
  let modifiedHtml = html;
  
  // 1. Título
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/is, `<title>${meta.title}</title>`);
  
  // 2. Metas de descripción
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?name="description"[^>]*?>/is, `<meta name="description" content="${meta.description}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?property="og:description"[^>]*?>/is, `<meta property="og:description" content="${meta.description}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?name="twitter:description"[^>]*?>/is, `<meta name="twitter:description" content="${meta.description}" />`);
  
  // 3. Metas de título
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?property="og:title"[^>]*?>/is, `<meta property="og:title" content="${meta.title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?name="twitter:title"[^>]*?>/is, `<meta name="twitter:title" content="${meta.title}" />`);

  // 4. Metas de imagen
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?property="og:image"[^>]*?>/is, `<meta property="og:image" content="${meta.image}" />`);
  
  // Metadatos adicionales para WhatsApp/FB
  if (!modifiedHtml.includes('property="og:image:width"')) {
    modifiedHtml = modifiedHtml.replace('</head>', `<meta property="og:image:width" content="800" />\n<meta property="og:image:height" content="800" />\n<meta property="og:image:secure_url" content="${meta.image}" />\n</head>`);
  }
  
  if (modifiedHtml.includes('name="twitter:image"')) {
    modifiedHtml = modifiedHtml.replace(/<meta[^>]*?name="twitter:image"[^>]*?>/is, `<meta name="twitter:image" content="${meta.image}" />`);
  } else {
    modifiedHtml = modifiedHtml.replace('</head>', `<meta name="twitter:image" content="${meta.image}" />\n</head>`);
  }

  // 5. Meta de URL
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*?property="og:url"[^>]*?>/is, `<meta property="og:url" content="${meta.url}" />`);

  return modifiedHtml;
};

// Fallback HTML if template fails
const generateFallbackHtml = (meta) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="800" />
    <meta property="og:image:secure_url" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
</head>
<body>
    <script>
        window.location.replace("${meta.url}");
    </script>
    <p>Redirigiendo...</p>
</body>
</html>`;

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
    const description = descRaw
      .replace(/Desde\s+S\/\.?\s*[\d.,]+\s*PEN\.?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 150) || 'Pieza personalizada hecha a pedido. Joyería de autor | Enigma Artesanías.';
    
    const meta = {
      title: `${producto.titulo} | Enigma Joyería de Autor`,
      description,
      image: getAbsoluteUrl(producto.imagen_principal_url),
      url: `https://artesaniasenigma.com/producto/${producto.id}`
    };

    let template = getTemplate();
    let html = template ? injectMetaTags(template, meta) : generateFallbackHtml(meta);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Permitir cache público para acelerar la carga en redes sociales (WhatsApp/FB), 
    // pero con s-maxage para refrescar si cambia.
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en la función shareProduct:", err);
    return res.status(500).send("Error interno del servidor");
  }
});

export const shareCatalog = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  try {
    const pathParts = req.path.split('/').filter(Boolean);
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

    const meta = {
      title: tituloOG,
      description: `Colección de ${catLower} de diseño forjadas a mano en ${matDisplay}. Explora nuestro portafolio de piezas de autor hechas a pedido.`,
      image: 'https://artesaniasenigma.com/logo2.png',
      url: `https://artesaniasenigma.com${req.path}`
    };

    let template = getTemplate();
    let html = template ? injectMetaTags(template, meta) : generateFallbackHtml(meta);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).send(html);

  } catch (err) {
    console.error("Error en shareCatalog:", err);
    return res.status(500).send("Error interno del servidor");
  }
});
