import { Link } from 'react-router-dom';
import { ChevronRight, Instagram } from 'lucide-react';
import andruDonalds from '../assets/images/andru.jpg';

const CelebrityCollaboration = () => {
    return (
        <section
            aria-labelledby="andru-title"
            className="celebrity-section relative overflow-hidden px-4 py-6 md:px-8 md:py-14"
        >
            {/* CSS Forzado para asegurar fondo y proporciones */}
            <style jsx="true">{`
                .celebrity-section {
                    background-color: #f3f2f0 !important;
                    background: #f3f2f0 !important;
                }
                .celebrity-border-line {
                    background-color: #e5e3df !important;
                }
            `}</style>

            {/* Líneas delimitadoras superior e inferior */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px celebrity-border-line" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px celebrity-border-line" />

            <div className="relative z-10 mx-auto flex max-w-4xl flex-row items-center gap-4 md:gap-14">

                {/* ── Foto ── */}
                <div className="relative shrink-0 md:w-5/12">
                    <div className="hidden md:block pointer-events-none absolute inset-0 scale-[1.03] rounded-xl border border-[#0f766e]/20" />
                    <img
                        src={andruDonalds}
                        alt="Andru Donalds luciendo joyas de Enigma Artesanías"
                        loading="lazy"
                        className="
                            block h-44 w-28 rounded-xl object-cover object-top
                            border border-[#0f766e]/30
                            shadow-[0_4px_20px_rgba(0,0,0,0.08)]
                            md:h-auto md:w-full md:aspect-[4/5] md:object-center
                            md:border-[#0f766e]/30 md:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                        "
                    />
                    <a
                        href="https://www.instagram.com/andrudonalds/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            hidden md:flex items-center gap-1.5
                            absolute bottom-3 right-3 rounded-full
                            border border-[#0f766e]/30 bg-[#ffffff]/90 px-3 py-1.5
                            text-xs tracking-wider text-[#1c1917] no-underline shadow-sm
                            transition-colors hover:border-[#0f766e]
                        "
                    >
                        Desde 2022
                        <Instagram size={12} className="text-[#0f766e]" aria-hidden="true" />
                    </a>
                </div>

                {/* ── Contenido Reducido y Delicado ── */}
                <div className="min-w-0 flex-1 text-left md:text-center">
                    <p className="mb-1 text-[9px] font-normal uppercase tracking-[0.20em] text-[#0f766e] md:mb-3 md:text-xs md:tracking-[0.26em]">
                        Colaboración exclusiva
                    </p>

                    <h2
                        id="andru-title"
                        className="
                            font-['Cormorant_Garamond',serif] font-normal leading-tight
                            text-lg text-[#1c1917] md:text-5xl md:tracking-wide
                        "
                    >
                        Andru Donalds
                        <span className="ml-1 italic text-[#0f766e] md:ml-0 md:block">
                            &amp; Enigma
                        </span>
                    </h2>

                    {/* Cita en móvil: tipografía delicada e interlineado cómodo */}
                    <p className="mt-1.5 line-clamp-3 text-[11px] font-light leading-relaxed text-[#57534e] md:hidden">
                        "La voz de Enigma luce nuestras piezas en sus giras internacionales desde 2022."
                    </p>

                    {/* Cita en desktop */}
                    <p className="hidden md:block mx-auto mt-6 max-w-md text-base font-light leading-relaxed text-[#44403c]">
                        "Andru Donalds, la voz icónica de los grandes éxitos de Enigma.
                        Desde 2022, cada pieza que luce en sus giras internacionales
                        nace en este mismo taller en Lima. Dos nombres, una misma identidad."
                    </p>

                    {/* Enlace limpio en 1 sola línea */}
                    <Link
                        to="/andru-donalds"
                        className="
                            mt-3 inline-flex items-center gap-1 rounded
                            text-[10px] font-medium uppercase tracking-[0.15em] text-[#0f766e]
                            transition-colors hover:text-[#042f2e]
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]
                            md:mt-8 md:gap-2 md:rounded-sm md:border md:border-[#0f766e]/40
                            md:px-7 md:py-3 md:text-xs md:text-[#1c1917]
                            md:hover:border-[#0f766e] md:hover:text-[#0f766e]
                        "
                    >
                        Ver colección
                        <ChevronRight size={12} aria-hidden="true" />
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default CelebrityCollaboration;