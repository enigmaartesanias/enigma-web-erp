import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * ImageUploader: Subida directa de imágenes a Supabase Storage
 * - Sin canvas ni scripts de re-codificación que aumenten el peso.
 * - Validación estricta: Máximo 2 MB. Si pesa más, detiene y alerta.
 * - Si pesa <= 2 MB: Se sube DIRECTAMENTE en su formato original al seleccionarla.
 * - Asigna la URL pública de forma inmediata mediante onUploadSuccess.
 */
const ImageUploader = ({ 
    onUploadSuccess, 
    bucketName = 'producto-images',
    compact = false,
    hideTitle = false
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 1. Validación estricta de peso: Máximo 2 MB (2,097,152 bytes)
        const MAX_SIZE_BYTES = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            setUploadError('El archivo supera el límite de 2 MB permitidos');
            event.target.value = '';
            return;
        }

        // 2. Preparar subida
        setUploadError(null);
        setUploading(true);

        try {
            // 3. Extensión y nombre seguro para Supabase Storage
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const cleanName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9]/g, "_")
                .slice(0, 30);
            const filePath = `${uuidv4()}-${cleanName}.${fileExt}`;

            // 4. Subida directa del archivo original sin re-compresión
            const { error: uploadErr } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'image/jpeg'
                });

            if (uploadErr) {
                throw uploadErr;
            }

            // 5. Obtener URL pública directa
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error('No se pudo obtener la URL pública de la imagen.');
            }

            console.log('✅ Imagen subida con éxito:', publicUrl);

            // 6. Asignación inmediata al estado del formulario
            if (onUploadSuccess) {
                onUploadSuccess(publicUrl);
            }
        } catch (err) {
            console.error('Error al subir imagen a Supabase Storage:', err);
            setUploadError(`Error al subir imagen: ${err.message || 'Verifica permisos de almacenamiento'}`);
        } finally {
            setUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <div className={compact ? "border border-stone-200 rounded-lg p-2.5 bg-stone-50/50" : "border border-stone-200 p-3.5 rounded-xl shadow-xs bg-white"}>
            {!hideTitle && !compact && (
                <p className="text-xs font-medium text-stone-600 mb-2">Subir Imagen (máx. 2 MB)</p>
            )}

            <div className="flex flex-col gap-2">
                {uploading ? (
                    <div className="flex items-center text-stone-700 text-xs gap-2 py-2">
                        <svg className="animate-spin h-4 w-4 text-stone-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-medium">Subiendo foto a Supabase...</span>
                    </div>
                ) : (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-xs text-stone-500
                        file:mr-2.5 file:py-1 file:px-2.5
                        file:rounded-md file:border-0
                        file:text-xs file:font-medium
                        file:bg-stone-200/70 file:text-stone-700
                        hover:file:bg-stone-300 transition-colors cursor-pointer"
                    />
                )}

                {uploadError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-2.5 py-1.5 rounded-md flex items-center justify-between">
                        <span>{uploadError}</span>
                        <button 
                            type="button" 
                            onClick={() => setUploadError(null)} 
                            className="text-red-400 hover:text-red-600 ml-2"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;