import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';

const SocialProof = () => {
    const socialStats = [
        {
            platform: 'Instagram',
            followers: '17.5k',
            icon: FaInstagram,
            url: 'https://www.instagram.com/enigma_artesanias/',
            color: 'from-purple-600 to-pink-600',
            iconColor: 'text-pink-500'
        },
        {
            platform: 'TikTok',
            followers: '2.8k',
            icon: FaTiktok,
            url: 'https://www.tiktok.com/@artesaniasenigma',
            color: 'from-gray-900 to-gray-700',
            iconColor: 'text-gray-900'
        },
        {
            platform: 'Facebook',
            followers: '14.5k',
            icon: FaFacebook,
            url: 'https://www.facebook.com/enigmaartesaniasyaccesorios/',
            color: 'from-blue-600 to-blue-800',
            iconColor: 'text-blue-600'
        },
        {
            platform: 'YouTube',
            followers: '7.4k',
            icon: FaYoutube,
            url: 'https://www.youtube.com/@artesaniasenigma',
            color: 'from-red-600 to-red-700',
            iconColor: 'text-red-600'
        }
    ];

    return (
        <section className="pt-4 pb-8 md:py-16 bg-white">
            <div className="container mx-auto px-4 md:px-8 lg:px-16">

                {/* Header - más compacto */}
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                        Únete a Nuestra Comunidad
                    </h2>
                    <div className="w-16 h-0.5 bg-yellow-500 mx-auto mb-3"></div>
                    <p className="text-base md:text-xl text-gray-600">
                        Más de <span className="font-bold text-gray-900">42,000 seguidores</span> confían en nuestro arte
                    </p>
                </div>

                {/* Social Media Stats - más compacto */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6 max-w-4xl mx-auto">
                    {socialStats.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-2 md:p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <Icon className={`w-5 h-5 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 ${social.iconColor} group-hover:scale-110 transition-transform`} />
                                    <div className="text-sm md:text-xl font-medium text-gray-900">
                                        {social.followers}
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
