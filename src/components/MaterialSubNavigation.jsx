import React from 'react';
import { Link } from 'react-router-dom';

const MaterialSubNavigation = ({ material, currentCategory }) => {
    if (!material || material === 'all') return null;

    const categories = [
        { name: 'Aretes', slug: 'Arete' },
        { name: 'Pulseras', slug: 'Pulsera' },
        { name: 'Anillos', slug: 'Anillo' },
        { name: 'Collares', slug: 'Collar' },
    ];

    return (
        <div className="w-full flex justify-center mb-8">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-2">
                {categories.map((cat) => {
                    const isActive = currentCategory.toLowerCase() === cat.slug.toLowerCase();

                    return (
                        <Link
                            key={cat.slug}
                            to={`/catalogo/${material}/${cat.slug}`}
                            className={`
                                text-xs font-bold transition-colors duration-300 pb-1
                                uppercase tracking-widest
                                ${isActive
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-400 hover:text-gray-800 border-b-2 border-transparent'}
                            `}
                        >
                            {cat.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MaterialSubNavigation;
