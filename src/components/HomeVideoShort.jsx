import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeVideoShort = () => {
    const navigate = useNavigate();

    return (
        <section className="bg-stone-900 text-stone-100 py-20 px-6 md:px-12">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">

                {/* Lado Izquierdo: Preview Visual Estilizado */}
                <div className="w-full md:w-1/2 flex-shrink-0">
                    <div className="relative aspect-video w-full rounded-sm border border-stone-700 overflow-hidden bg-stone-950">
                        <img
                            src="https://img.youtube.com/vi/_KdRykr7pbc/mqdefault.jpg"
                            alt="Archivo Histórico Enigma"
                            className="w-full h-full object-cover opacity-60 filter grayscale hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-12 h-12 rounded-full border border-stone-400 flex items-center justify-center bg-stone-900/80 text-stone-300 backdrop-blur-xs">
                                ✦
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lado Derecho: Invitación a la Lectura */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <span className="block text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4 font-medium">
                        El Origen del Oficio
                    </span>
                    <h2 className="text-xl md:text-2xl font-light tracking-wide text-stone-200 mb-4 uppercase">
                        La Técnica
                    </h2>
                    <p className="text-sm text-stone-400 font-normal leading-relaxed mb-6">
                        En Enigma Joyas de Autor, combinamos técnicas ancestrales como el alambrismo y el martillado
                        con acabados oxidados contemporáneos que otorgan carácter y autenticidad a cada pieza.
                    </p>
                    <button
                        onClick={() => navigate('/el-oficio')}
                        className="inline-block text-xs tracking-widest uppercase text-[#c8964a] hover:text-stone-100 transition-colors bg-none border-none cursor-pointer"
                    >
                        Ver más detalles del taller →
                    </button>
                </div>

            </div>
        </section>
    );
};

export default HomeVideoShort;