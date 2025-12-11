import React from 'react';

const HomeVideoShort = () => {
    const video = {
        iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/UI1cGnz4MDA" title="Un trabajo en alpaca y resina" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
        title: 'Un trabajo en alpaca y resina',
    };

    return (
        <section className="bg-gray-50 pt-10 pb-4 md:py-24 border-t border-gray-100">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-lg md:text-3xl font-semibold text-gray-900 mb-6 font-serif uppercase tracking-widest">
                    La Magia detrás del Metal
                </h2>

                <div className="flex flex-col items-center">
                    <div
                        className="rounded-xl overflow-hidden shadow-2xl bg-black flex justify-center w-full transform hover:scale-[1.02] transition-transform duration-500"
                        style={{
                            aspectRatio: '371/659',
                            maxWidth: 340,
                            margin: '0 auto',
                        }}
                        dangerouslySetInnerHTML={{ __html: video.iframe }}
                    />
                </div>
            </div>
        </section>
    );
};

export default HomeVideoShort;
