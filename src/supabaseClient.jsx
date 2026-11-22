import { createClient } from '@supabase/supabase-js';

export const SUPABASE_BUCKET = 'andru';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Obtiene la ruta interna del archivo a partir de su URL pública
// (sirve para borrar). Devuelve null si la URL no es de este bucket
// (por ejemplo, una URL antigua de Firebase).
export const storagePathFromUrl = (url = '') => {
    const marker = `/object/public/${SUPABASE_BUCKET}/`;
    const i = url.indexOf(marker);
    if (i === -1) return null;
    return decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
};

// Exporta también el módulo de autenticación
export const auth = supabase.auth;