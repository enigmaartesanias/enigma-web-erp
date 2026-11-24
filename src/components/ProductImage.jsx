import React from 'react';

const ProductImage = ({ src, alt, className = 'w-full h-full object-contain bg-gray-50' }) => {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
};

export default ProductImage;
