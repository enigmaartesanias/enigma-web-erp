import imageCompression from 'browser-image-compression';

/**
 * Comprime y redimensiona una imagen manteniendo proporciones
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @param {number} options.maxSizeMB - Tamaño máximo en MB (default: 1)
 * @param {number} options.maxWidth - Ancho máximo en px (default: 1200)
 * @param {number} options.maxHeight - Alto máximo en px (default: 1200)
 * @param {number} options.quality - Calidad de compresión 0-1 (default: 0.95)
 * @returns {Promise<File>} - Archivo de imagen optimizado
 */
export const compressAndResizeImage = async (file, options = {}) => {
    const {
        maxSizeMB = 1,
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.95
    } = options;

    try {
        // Paso 1: Comprimir el archivo para reducir tamaño
        const compressionOptions = {
            maxSizeMB,
            useWebWorker: true,
            maxIteration: 10,
        };

        const compressedBlob = await imageCompression(file, compressionOptions);

        // Paso 2: Procesar la imagen con Canvas para redimensionar manteniendo proporciones
        const processedFile = await processImageWithCanvas(compressedBlob, maxWidth, maxHeight, quality);

        console.log('✅ Imagen optimizada:', {
            original: `${(file.size / 1024).toFixed(2)} KB`,
            optimizada: `${(processedFile.size / 1024).toFixed(2)} KB`,
            reduccion: `${(((file.size - processedFile.size) / file.size) * 100).toFixed(1)}%`
        });

        return processedFile;
    } catch (error) {
        console.error('❌ Error al optimizar imagen:', error);
        throw new Error(`Error al procesar la imagen: ${error.message}`);
    }
};

/**
 * Procesa una imagen con Canvas (redimensiona SIN recortar, mantiene proporciones)
 * @private
 */
const processImageWithCanvas = (imageBlob, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calcular nuevas dimensiones manteniendo proporciones
                let newWidth = img.width;
                let newHeight = img.height;

                if (newWidth > maxWidth) {
                    newHeight = (newHeight * maxWidth) / newWidth;
                    newWidth = maxWidth;
                }

                if (newHeight > maxHeight) {
                    newWidth = (newWidth * maxHeight) / newHeight;
                    newHeight = maxHeight;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = newWidth;
                canvas.height = newHeight;

                // Dibujar imagen redimensionada sin recortar
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const processedFile = new File([blob], imageBlob.name || 'image.jpg', {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(processedFile);
                        } else {
                            reject(new Error('No se pudo convertir el canvas a Blob.'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('No se pudo cargar la imagen para procesamiento Canvas.'));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Error al leer el archivo de imagen.'));
        };

        reader.readAsDataURL(imageBlob);
    });
};

/**
 * Valida que el archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo permitido en MB
 * @returns {Object} - {valid: boolean, error: string}
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
    if (!file) {
        return { valid: false, error: 'No se seleccionó ningún archivo' };
    }

    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Solo se permiten archivos de imagen (JPG, PNG, etc.)' };
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, error: `La imagen no debe superar los ${maxSizeMB}MB` };
    }

    return { valid: true, error: null };
};
