import React from 'react';
import { TbBrandInstagram, TbBrandTiktok, TbBrandFacebook, TbBrandYoutube } from 'react-icons/tb';

const css = `
.sp-section{display:block;clear:both;width:100%;background:#e4dacb;padding:44px 0 40px;}
.sp-wrap{max-width:420px;margin:0 auto;padding:0 16px;display:flex;flex-direction:column;align-items:center;text-align:center;}

/* Encabezado: mismo estilo que Colecciones Artesanales / Piezas Disponibles */
.sp-title{margin:0 0 8px;font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;line-height:1.15;letter-spacing:.04em;color:#2a2018;}
.sp-rule{display:block;width:30px;height:1px;background:#c8964a;opacity:.6;margin:0 auto 12px;}
.sp-text{margin:0 auto 24px;max-width:300px;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;line-height:1.6;color:#4f453d;}

/* Iconos: círculos de 46px con icono de 22px */
.sp-icons{display:flex;align-items:center;justify-content:center;gap:20px;}
.sp-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;border:1px solid rgba(154,107,39,0.5);color:#2a2018;background:transparent;text-decoration:none;transition:background-color .25s ease,border-color .25s ease,color .25s ease;}
.sp-icon svg{width:22px;height:22px;}
.sp-icon:hover{background:#2a2018;border-color:#2a2018;color:#f5f1ec;}
.sp-icon:focus-visible{outline:2px solid #c8964a;outline-offset:3px;}

@media (min-width:768px){
  .sp-section{padding:48px 0 52px;}
  .sp-text{margin-bottom:28px;}
}
`;

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
        <section className="sp-section" aria-label="Redes sociales">
            <style>{css}</style>

            <div className="sp-wrap">
                <h2 className="sp-title">El taller, visto de cerca</h2>
                <span className="sp-rule" />
                <p className="sp-text">
                    Procesos y piezas, directo desde el banco de trabajo.
                </p>

                <div className="sp-icons">
                    {socialStats.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.platform}
                                className="sp-icon"
                            >
                                <Icon strokeWidth={1.3} aria-hidden="true" />
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;