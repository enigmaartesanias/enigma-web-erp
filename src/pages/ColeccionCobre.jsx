import React from 'react';
import { Link } from 'react-router-dom';
import { FaShareAlt, FaPlayCircle } from 'react-icons/fa';

const ShareIcon = ({ anchor }) => {
    const handleShare = () => {
        const url = `${window.location.origin}/cobre${anchor}`;
        navigator.clipboard.writeText(url);
        alert('¡Link copiado!');
    };

    return (
        <button 
            onClick={handleShare} 
            className="ml-3 p-1.5 rounded-full border border-[#c8964a] text-[#c8964a] hover:bg-[#c8964a] hover:text-white transition-colors focus:outline-none flex items-center justify-center" 
            title="Compartir esta sección"
        >
            <FaShareAlt size={12} />
        </button>
    );
};

const ColeccionCobre = () => {
    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; 
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#faf9f7] font-sans min-h-screen text-[#2a2018] pt-[64px] md:pt-[72px]">
            {/* 2. HERO */}
            <div className="relative w-full min-h-[50vh] py-20 md:py-0 bg-[#2a2018] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                <img src="/images/tecnica.jpg" alt="Taller trabajando cobre" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-[#2a2018]/40" />
                <div className="relative z-10 flex flex-col items-center max-w-3xl">
                    <p className="text-[#c8964a] uppercase text-sm tracking-widest mb-4 font-semibold drop-shadow-md">Colección</p>
                    <h1 className="text-5xl md:text-6xl text-[#faf9f7] font-serif mb-6 drop-shadow-lg leading-tight">Cobre Artesanal</h1>
                    <p className="text-[#faf9f7] text-lg md:text-xl font-light drop-shadow-md">Metal vivo, energía ancestral, forjado a mano en Lima</p>
                </div>
            </div>

            {/* 3. BARRA DE PÍLDORAS */}
            <div className="sticky top-[64px] md:top-[72px] z-40 bg-[#faf9f7] border-b border-[#e8e4de] w-full">
                <div className="flex w-full">
                    {['historia', 'mistica', 'proceso', 'coleccion'].map((section) => (
                        <a 
                            key={section}
                            href={`#${section}`}
                            onClick={(e) => scrollToSection(e, section)}
                            className="flex-1 text-center py-3 text-sm md:text-base text-[#6a5a4a] hover:text-[#c8964a] hover:bg-[#fdf6ee] border-r border-[#e8e4de] last:border-r-0 capitalize tracking-wider transition-colors font-medium"
                        >
                            {section === 'mistica' ? 'Mística' : section === 'coleccion' ? 'Colección' : section}
                        </a>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-4xl py-12 space-y-12 md:space-y-24">
                
                {/* 4. SECCIÓN HISTORIA */}
                <section id="historia" className="scroll-mt-24">
                    <div className="flex items-center mb-6">
                        <h2 className="text-sm uppercase tracking-widest text-[#c8964a] font-medium">Historia</h2>
                        <ShareIcon anchor="#historia" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <p className="flex-1 text-[#6a5a4a] leading-relaxed text-lg font-light">
                            El cobre ha sido parte de la humanidad desde los albores de la civilización. En Enigma, retomamos esta herencia milenaria para forjar joyas que no solo adornan, sino que conectan con nuestras raíces. Cada martillazo y cada doblez es un tributo a las técnicas ancestrales que mantenemos vivas en nuestro taller.
                        </p>
                        <div className="flex-1 w-full h-64 bg-[#e8e4de] border border-[#e8e4de] flex items-center justify-center text-[#6a5a4a] rounded-sm overflow-hidden shadow-sm">
                            <img src="/images/img1.jpg" alt="Pieza de cobre terminada" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                </section>

                {/* 5. SECCIÓN MÍSTICA */}
                <section id="mistica" className="bg-[#fdf6ee] p-8 md:p-12 border border-[#e8e4de] scroll-mt-24 rounded-sm">
                    <div className="flex items-center mb-6">
                        <h2 className="text-sm uppercase tracking-widest text-[#c8964a] font-medium">Mística</h2>
                        <ShareIcon anchor="#mistica" />
                    </div>
                    <p className="text-[#6a5a4a] leading-relaxed text-lg font-light">
                        Más allá de su belleza cálida, el cobre es conocido como un excelente conductor de energía. Históricamente se le atribuyen propiedades sanadoras, ayudando a equilibrar las energías del cuerpo, aliviar dolencias articulares y fomentar la vitalidad física y espiritual de quien lo porta.
                    </p>
                </section>

                {/* 6. SECCIÓN PROCESO */}
                <section id="proceso" className="scroll-mt-24">
                    <div className="flex items-center mb-6">
                        <h2 className="text-sm uppercase tracking-widest text-[#c8964a] font-medium">Proceso</h2>
                        <ShareIcon anchor="#proceso" />
                    </div>
                    <div className="flex flex-col md:flex-row-reverse gap-10 items-start">
                        <p className="flex-1 text-[#6a5a4a] leading-relaxed text-lg font-light">
                            Todo comienza con un trozo de cobre crudo. Mediante el fuego, el martillo y la paciencia, moldeamos cada curva. No usamos moldes; cada pieza es esculpida a mano, garantizando que tu joya sea única.
                        </p>
                        <div className="flex-1 w-full aspect-video bg-[#e8e4de] border border-[#e8e4de] flex flex-col items-center justify-center text-[#6a5a4a] rounded-sm relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group">
                                <FaPlayCircle size={48} className="text-[#faf9f7] opacity-90 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <img src="/images/img2.jpg" alt="Proceso de trabajo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </section>

                {/* 7. SECCIÓN COLECCIÓN */}
                <section id="coleccion" className="scroll-mt-24">
                    <div className="flex items-center mb-4">
                        <h2 className="text-sm uppercase tracking-widest text-[#c8964a] font-medium">Colección</h2>
                        <ShareIcon anchor="#coleccion" />
                    </div>
                    <p className="text-[#2a2018] text-2xl font-normal mb-8">Explora nuestras categorías en cobre</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: 'Aretes', image: '/images/aretes.jpg', path: '/catalogo/Cobre/Arete' },
                            { name: 'Pulseras', image: '/images/pulsera3.jpg', path: '/catalogo/Cobre/Pulsera' },
                            { name: 'Anillos', image: '/images/anillos.jpg', path: '/catalogo/Cobre/Anillo' },
                            { name: 'Collares', image: '/images/collares.jpg', path: '/catalogo/Cobre/Collar' },
                            { name: 'Vinchas', image: '/images/img1.jpg', path: '/catalogo/Cobre/VINCHA_TIARA' },
                            { name: 'Tobilleras', image: '/images/img2.jpg', path: '/catalogo/Cobre/TOBILLERA' }
                        ].map(cat => (
                            <Link 
                                key={cat.name} 
                                to={cat.path}
                                className="flex flex-row items-center p-3 bg-white border border-[#d4b896] rounded-[8px] hover:bg-[#fdf6ee] transition-all group shadow-sm hover:shadow-md overflow-hidden"
                            >
                                <div className="w-24 h-16 rounded-[4px] overflow-hidden mr-4 border border-[#e8e4de] flex-shrink-0 bg-gray-100">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <span className="text-[#2a2018] font-medium tracking-wide flex-1 text-lg">{cat.name}</span>
                                <span className="text-[#c8964a] text-xl opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 mr-2">→</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 8. SECCIÓN CUIDADO Y LIMPIEZA */}
                <section id="cuidado" className="bg-[#fdf6ee] p-8 md:p-12 border border-[#e8e4de] scroll-mt-24 rounded-sm">
                    <div className="flex items-center mb-6">
                        <h2 className="text-sm uppercase tracking-widest text-[#c8964a] font-medium">Cuidado y Limpieza</h2>
                        <ShareIcon anchor="#cuidado" />
                    </div>
                    <ol className="space-y-6 text-[#6a5a4a] text-lg font-light list-decimal pl-5 marker:text-[#c8964a] marker:font-medium">
                        <li className="pl-2">
                            <strong className="text-[#2a2018] font-medium">Limpieza natural</strong> — Limón y sal devuelven el brillo. Frota suave y enjuaga.
                        </li>
                        <li className="pl-2">
                            <strong className="text-[#2a2018] font-medium">Evita humedad</strong> — Retírala antes de bañarte o nadar.
                        </li>
                        <li className="pl-2">
                            <strong className="text-[#2a2018] font-medium">Almacenamiento</strong> — Bolsitas de tela individual, lugar seco.
                        </li>
                    </ol>
                </section>

            </div>
        </div>
    );
};

export default ColeccionCobre;
