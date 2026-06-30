import React from 'react';
import { TbBrandInstagram, TbBrandTiktok, TbBrandFacebook, TbBrandYoutube } from 'react-icons/tb';

const SocialProof = () => {
    const socialStats = [
        {
            platform: 'Instagram',
            icon: TbBrandInstagram,
            url: 'https://www.instagram.com/enigma_artesanias/',
        },
        {
            platform: 'TikTok',
            icon: TbBrandTiktok,
            url: 'https://www.tiktok.com/@artesaniasenigma',
        },
        {
            platform: 'Facebook',
            icon: TbBrandFacebook,
            url: 'https://www.facebook.com/enigmaartesaniasyaccesorios/',
        },
        {
            platform: 'YouTube',
            icon: TbBrandYoutube,
            url: 'https://www.youtube.com/@artesaniasenigma',
        }
    ];

    return (
        // Fondo claro (crema, igual que Galeria.jsx) en vez de oscuro.
        // Esta sección queda entre "Joyas con Historia" (oscuro) y el Footer
        // (oscuro) — necesita ser clara para romper el bloque negro apilado
        // y darle ritmo a la página en vez de fundirse con lo de arriba/abajo.
        <section
            className="py-14 md:py-16 w-full"
            style={{ background: '#f5f1ec', display: 'block', clear: 'both' }}
        >
            <div className="container mx-auto px-4">

                <div className="flex flex-col items-center mx-auto text-center" style={{ maxWidth: '420px' }}>

                    {/* Línea dorada superior — mismo detalle que el resto del sitio */}
                    <div style={{
                        width: '30px',
                        height: '0.5px',
                        background: '#c8964a',
                        opacity: 0.7,
                        marginBottom: '18px',
                    }} />

                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 10px',
                    }}>
                        Nuestra Comunidad
                    </p>

                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(26px, 4vw, 30px)',
                        fontWeight: '300',
                        color: '#2a2018',
                        letterSpacing: '0.02em',
                        margin: '0 0 14px',
                        lineHeight: '1.3',
                    }}>
                        El taller, visto de cerca
                    </h2>

                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        fontWeight: '300',
                        lineHeight: '1.7',
                        color: '#5c5346',
                        margin: '0 0 36px',
                        maxWidth: '300px',
                    }}>
                        Donde compartimos el proceso artesanal y la vida de cada pieza, directo desde el banco de trabajo.
                    </p>

                    {/* Iconos sociales: círculos individuales con borde fino dorado
                        sobre fondo claro. Mismo tratamiento que la versión oscura,
                        invertido en color para mantener contraste y elegancia. */}
                    <div className="flex items-center justify-center gap-4">
                        {socialStats.map((social) => {
                            const Icon = social.icon;
                            return (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.platform}
                                    className="group"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        border: '0.5px solid rgba(200,150,74,0.45)',
                                        transition: 'border-color 0.25s ease, background-color 0.25s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#c8964a';
                                        e.currentTarget.style.backgroundColor = 'rgba(200,150,74,0.10)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(200,150,74,0.45)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Icon
                                        className="transition-colors duration-200"
                                        style={{ width: '20px', height: '20px', color: '#2a2018' }}
                                        strokeWidth={1.3}
                                    />
                                </a>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    );
};

export default SocialProof;
