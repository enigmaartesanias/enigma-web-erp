import { Link } from 'react-router-dom';
import tecnica from '../../assets/images/tecnica.jpg';

const ElTaller = () => {
    return (
        <div className="bg-white">


            {/* Imagen de Técnica */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="flex justify-center">
                        <img
                            src={tecnica}
                            alt="Orfebre trabajando con técnicas artesanales"
                            className="w-full max-w-md h-auto rounded-lg shadow-xl object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* La Técnica - 25 Años */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                            25 Años de Aprendizaje y Creatividad
                        </h2>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-base text-gray-700 leading-relaxed mb-6">
                                Desde hace más de 25 años, mi pasión por la orfebrería me ha llevado a explorar, experimentar y aprender día a día. Cada joya que creo es el resultado de investigación, pruebas, errores y descubrimientos.
                            </p>
                            <p className="text-base text-gray-700 leading-relaxed mb-6 font-semibold text-gray-900">
                                No existen dos piezas iguales: cada una es un diseño único, pensado para sorprender y emocionar.
                            </p>
                            <p className="text-base text-gray-700 leading-relaxed">
                                Trabajar en mi taller me permite controlar cada etapa: desde la inspiración inicial hasta el acabado final. Los retos forman parte de mi rutina: nuevas técnicas, combinaciones de materiales o acabados especiales me obligan a innovar constantemente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mi Proceso Artesanal Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                            Mi Proceso Artesanal
                        </h2>
                        <p className="text-base text-gray-700 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
                            Cada etapa del proceso está bajo mi control directo. Los retos son constantes: nuevas técnicas, combinaciones de materiales y acabados especiales me impulsan a innovar día a día.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Técnica 1 */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Alambrismo y Filigrana
                                </h3>
                                <p className="text-gray-700">
                                    Hilos de metal que se entrelazan creando patrones delicados, resultado de paciencia y ensayo. Cada diseño es único, trabajado a mano con precisión milimétrica.
                                </p>
                            </div>

                            {/* Técnica 2 */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Martillado y Texturizado
                                </h3>
                                <p className="text-gray-700">
                                    Cada golpe es pensado, aportando carácter y profundidad. El martillado crea texturas únicas que dan vida y personalidad a cada pieza.
                                </p>
                            </div>

                            {/* Técnica 3 */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Soldadura Precisa
                                </h3>
                                <p className="text-gray-700">
                                    Las uniones son invisibles pero fuertes, un equilibrio entre estética y resistencia. Cada soldadura garantiza la durabilidad de la joya.
                                </p>
                            </div>

                            {/* Técnica 4 */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Engaste de Piedras y Elementos Naturales
                                </h3>
                                <p className="text-gray-700">
                                    Trabajo con amatistas, labradoritas, cuarzos, resinas, nácar y spondylus, adaptando cada engaste al diseño y a la historia de la pieza.
                                </p>
                            </div>

                            {/* Técnica 5 */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Acabados Envejecidos y Experimentales
                                </h3>
                                <p className="text-gray-700">
                                    Oxidados, patinados o modernos, buscando siempre sorprender y dar personalidad a la joya. Cada acabado cuenta una historia diferente.
                                </p>
                            </div>

                            {/* Diseños Personalizados - Mantener como 6ta tarjeta */}
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Diseños Únicos
                                </h3>
                                <p className="text-gray-700">
                                    Cada cliente tiene una historia. Trabajo en colaboración para crear piezas que reflejen su personalidad y estilo único.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Materiales que Inspiran Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                            Materiales que Inspiran
                        </h2>
                        <p className="text-base text-gray-700 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
                            Plata 950, cobre, alpaca, bronce y piedras naturales conviven con elementos exóticos y orgánicos. Cada material se estudia, se prueba y se actualiza en nuevas creaciones, garantizando piezas auténticas, duraderas y únicas.
                        </p>

                        <div className="max-w-2xl mx-auto">
                            {/* Metales */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                    Metales Nobles
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex flex-col items-center text-center">
                                        <span className="text-2xl mb-2">✦</span>
                                        <div>
                                            <strong className="text-gray-900">Plata 950:</strong>
                                            <p className="text-base text-gray-700">La plata de ley es mi material principal, conocida por su brillo y maleabilidad.</p>
                                        </div>
                                    </li>
                                    <li className="flex flex-col items-center text-center">
                                        <span className="text-2xl mb-2">✦</span>
                                        <div>
                                            <strong className="text-gray-900">Cobre:</strong>
                                            <p className="text-base text-gray-700">El cobre aporta calidez y un color rojizo único a las creaciones.</p>
                                        </div>
                                    </li>
                                    <li className="flex flex-col items-center text-center">
                                        <span className="text-2xl mb-2">✦</span>
                                        <div>
                                            <strong className="text-gray-900">Alpaca:</strong>
                                            <p className="text-base text-gray-700">Aleación versátil que permite crear piezas accesibles sin sacrificar calidad.</p>
                                        </div>
                                    </li>
                                    <li className="flex flex-col items-center text-center">
                                        <span className="text-2xl mb-2">✦</span>
                                        <div>
                                            <strong className="text-gray-900">Bronce:</strong>
                                            <p className="text-base text-gray-700">Material ancestral que aporta un carácter único y atemporal.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>


                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default ElTaller;
