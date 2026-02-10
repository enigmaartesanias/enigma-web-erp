import andruDonalds from '../assets/images/andru.jpg';

const CelebrityCollaboration = () => {
    return (
        <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-8 md:py-14 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                    {/* Imagen */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            {/* Badge "Artista de Confianza" */}
                            <div className="absolute -top-3 -left-3 bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-10">
                                ⭐ Artista de Confianza
                            </div>

                            <img
                                src={andruDonalds}
                                alt="Andru Donalds luciendo joyas de Enigma Artesanías"
                                className="w-full max-w-sm h-auto rounded-2xl shadow-2xl object-cover border-4 border-yellow-500/30"
                            />

                            {/* Badge "Desde 2022" - Ahora es un botón de Instagram */}
                            <a
                                href="https://www.instagram.com/andrudonalds/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute -bottom-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-1.5 group"
                            >
                                <span>Desde 2022</span>
                                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="text-center lg:text-left">
                        <div className="inline-block bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold mb-3">
                            COLABORACIÓN INTERNACIONAL
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
                            Creando Arte para
                            <span className="block text-yellow-400 mt-1">Andru Donalds</span>
                        </h2>

                        <p className="text-base md:text-lg text-gray-300 mb-4 leading-relaxed">
                            Desde 2022, tengo el honor de crear piezas únicas para <strong className="font-semibold text-white">Andru Donalds</strong>, voz principal del legendario proyecto musical <strong className="font-semibold text-yellow-400">ENIGMA</strong>.
                        </p>

                        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                            Una conexión que inspiró el nombre de mi taller y que representa mi compromiso con la excelencia artesanal. Cada pieza es diseñada exclusivamente para reflejar su estilo único: anillos con piedras naturales, cuarzos y dijes que combinan fuerza y elegancia.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CelebrityCollaboration;
