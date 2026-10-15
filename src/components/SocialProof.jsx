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
        // Fondo crema/marfil suave #e4dacb
        <section
            className="py-14 md:py-16 w-full"
            style={{ background: '#e4dacb', display: 'block', clear: 'both' }}
        >
            <div className="container mx-auto px-4">

                <div className="flex flex-col items-center mx-auto text-center" style={{ maxWidth: '420px' }}>

                    {/* Línea decorativa superior — adaptada para fondo claro */}
                    <div style={{
                        width: '30px',
                        height: '1px',
                        background: '#9a6b27',
                        opacity: 0.6,
                        marginBottom: '18px',
                    }} />

                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        color: '#9a6b27',
                        margin: '0 0 10px',
                    }}>
                        Nuestra Comunidad
                    </p>

                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(26px, 4vw, 30px)',
                        fontWeight: '400',
                        color: '#1c1917',
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
                        color: '#57534e',
                        margin: '0 0 36px',
                        maxWidth: '300px',
                    }}>
                        Donde compartimos el proceso artesanal y la vida de cada pieza, directo desde el banco de trabajo.
                    </p>

                    {/* Iconos sociales adaptados para fondo claro */}
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
                                        border: '1px solid rgba(154,107,39,0.35)',
                                        transition: 'border-color 0.25s ease, background-color 0.25s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#9a6b27';
                                        e.currentTarget.style.backgroundColor = 'rgba(154,107,39,0.12)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(154,107,39,0.35)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Icon
                                        className="transition-colors duration-200"
                                        style={{ width: '20px', height: '20px', color: '#1c1917' }}
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