# Plan de Implementación: Página Exclusiva Andru Donalds

## 📋 Objetivo
Crear una página **minimalista** dedicada exclusivamente a la colaboración con Andru Donalds, destacando su trayectoria como voz legendaria de ENIGMA, la conexión con Enigma Artesanías, y mostrando las piezas únicas creadas para él.

## 🛠️ Stack Tecnológico
- **Framework:** React 18+ con Vite
- **Estilos:** Tailwind CSS (utility-first, minimalista)
- **Routing:** React Router
- **Imágenes:** Lazy loading nativo
- **Animaciones:** Tailwind transitions (sutiles)

---

## 🎯 Estructura Minimalista (4 Secciones)

### 1. **Hero Section**

```jsx
<section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
  <div className="max-w-2xl mx-auto text-center">
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
      Andru Donalds
    </h1>
    <p className="text-xl md:text-2xl text-yellow-600 mb-8">
      La Voz de ENIGMA
    </p>
    <img 
      src="/assets/andru/hero.jpg" 
      alt="Andru Donalds"
      className="w-64 h-64 md:w-80 md:h-80 rounded-full mx-auto mb-8 object-cover border-4 border-white shadow-2xl"
    />
    <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
      Voz principal del legendario proyecto ENIGMA<br/>
      Más de 50 millones de discos vendidos mundialmente
    </p>
  </div>
</section>
```

---

### 2. **Biografía Minimalista**

**Contenido real de Andru Donalds:**

```jsx
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-4xl mx-auto px-4">
    
    {/* Título */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Una Voz Legendaria
      </h2>
      <div className="w-16 h-1 bg-yellow-600 mx-auto"></div>
    </div>

    {/* Bio Grid */}
    <div className="grid md:grid-cols-2 gap-12 items-center">
      
      {/* Imagen */}
      <div className="order-2 md:order-1">
        <img 
          src="/assets/andru/bio.jpg" 
          alt="Andru Donalds"
          className="rounded-lg shadow-xl w-full"
        />
      </div>

      {/* Texto */}
      <div className="order-1 md:order-2 space-y-6">
        <p className="text-gray-700 leading-relaxed">
          Nacido en Kingston, Jamaica (1974), Andru Donalds es un artista 
          multifacético cuya voz ha cautivado a millones alrededor del mundo. 
          Su estilo musical fusiona pop, rock, reggae y baladas, con influencias 
          de Bob Marley, Michael Jackson y Prince.
        </p>
        
        <p className="text-gray-700 leading-relaxed">
          En 1999, Michael Cretu, creador del legendario proyecto ENIGMA, 
          descubrió su voz y lo invitó a colaborar. Desde entonces, Andru ha 
          sido la voz principal en cuatro álbumes de ENIGMA, contribuyendo a 
          un proyecto que ha vendido más de 50 millones de discos y ganado 
          más de 100 premios de platino y oro.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Sus interpretaciones incluyen clásicos como "Modern Crusaders", 
          "Seven Lives" (tema oficial de los Juegos Olímpicos de Beijing 2008), 
          y "The Screen Behind The Mirror". Su voz única ha definido el sonido 
          de ENIGMA en la era moderna.
        </p>

        {/* Stats minimalistas */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">50M+</div>
            <div className="text-sm text-gray-600">Discos Vendidos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">100+</div>
            <div className="text-sm text-gray-600">Premios Platino/Oro</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### 3. **La Conexión con Enigma Artesanías**

```jsx
<section className="py-16 md:py-24 bg-gray-50">
  <div className="max-w-4xl mx-auto px-4">
    
    {/* Título */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Una Conexión que Trasciende la Música
      </h2>
      <div className="w-16 h-1 bg-yellow-600 mx-auto"></div>
    </div>

    {/* Historia */}
    <div className="prose prose-lg mx-auto text-gray-700">
      <p className="text-center leading-relaxed mb-8">
        Desde 2022, tengo el honor de crear piezas únicas para Andru Donalds. 
        Su conexión con el proyecto ENIGMA inspiró el nombre de mi taller, 
        y cada pieza que diseño para él refleja esa esencia mística y poderosa 
        que caracteriza tanto su música como su estilo personal.
      </p>
    </div>

    {/* Galería simple de 3 imágenes */}
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      <img src="/assets/andru/momento-01.jpg" className="rounded-lg shadow-lg w-full h-64 object-cover" />
      <img src="/assets/andru/momento-02.jpg" className="rounded-lg shadow-lg w-full h-64 object-cover" />
      <img src="/assets/andru/momento-03.jpg" className="rounded-lg shadow-lg w-full h-64 object-cover" />
    </div>
  </div>
</section>
```

---

### 4. **Galería de Piezas (Minimalista)**

```jsx
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-6xl mx-auto px-4">
    
    {/* Título */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Colección Privada
      </h2>
      <div className="w-16 h-1 bg-yellow-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Piezas únicas creadas exclusivamente para Andru</p>
    </div>

    {/* Grid de piezas */}
    <div className="grid md:grid-cols-3 gap-8">
      
      {/* Pieza 1 */}
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded-lg shadow-lg mb-4">
          <img 
            src="/assets/andru/pieza-01.jpg" 
            alt="Pieza 1"
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Anillo Cuarzo Negro</h3>
        <p className="text-sm text-gray-600">Plata 925 • 2022</p>
      </div>

      {/* Pieza 2 */}
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded-lg shadow-lg mb-4">
          <img 
            src="/assets/andru/pieza-02.jpg" 
            alt="Pieza 2"
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Dije Piedra Natural</h3>
        <p className="text-sm text-gray-600">Plata 925 • 2023</p>
      </div>

      {/* Pieza 3 */}
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded-lg shadow-lg mb-4">
          <img 
            src="/assets/andru/pieza-03.jpg" 
            alt="Pieza 3"
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Pulsera Artesanal</h3>
        <p className="text-sm text-gray-600">Cuero • Plata • 2023</p>
      </div>

      {/* Agregar más piezas según disponibilidad */}
      
    </div>
  </div>
</section>
```

---

### 5. **CTA Final (Minimalista)**

```jsx
<section className="py-16 md:py-24 bg-gray-900 text-white">
  <div className="max-w-2xl mx-auto px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">
      ¿Interesado en una Pieza Exclusiva?
    </h2>
    <p className="text-gray-300 mb-8 leading-relaxed">
      Cada pieza es única y personalizada según tu estilo y esencia
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="https://wa.me/51960282376?text=Hola,%20me%20interesa%20una%20pieza%20exclusiva"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
      >
        Contactar por WhatsApp
      </a>
      
      <Link 
        to="/catalogo"
        className="inline-flex items-center justify-center px-8 py-3 border-2 border-white hover:bg-white hover:text-gray-900 text-white font-medium rounded-lg transition-colors"
      >
        Ver Catálogo Completo
      </Link>
    </div>
  </div>
</section>
```

---

## 📁 Estructura de Archivos (Simplificada)

```
src/
├── pages/
│   └── AndruDonalds.jsx          # Componente único (todo en uno)
│
├── assets/
│   └── images/
│       └── andru/
│           ├── hero.jpg          # Imagen principal circular
│           ├── bio.jpg           # Foto para biografía
│           ├── momento-01.jpg    # Conexión 1
│           ├── momento-02.jpg    # Conexión 2
│           ├── momento-03.jpg    # Conexión 3
│           ├── pieza-01.jpg      # Galería
│           ├── pieza-02.jpg
│           ├── pieza-03.jpg
│           └── ...
│
└── App.jsx                       # Agregar ruta
```

**Nota:** Enfoque minimalista = un solo archivo componente, sin subdivisiones innecesarias.

---

## 🎨 Paleta de Colores Minimalista

```javascript
// tailwind.config.js - Ya está configurado
colors: {
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },
  yellow: {
    600: '#D97706',
    700: '#B45309',
  }
}
```

**Uso:**
- Fondos: `bg-white`, `bg-gray-50`, `bg-gray-900`
- Textos: `text-gray-900`, `text-gray-700`, `text-gray-600`
- Acentos: `text-yellow-600`, `bg-yellow-600`

---

## 🚀 Plan de Implementación (Simplificado)

### **Fase 1: Setup** (30 min)
1. Crear `src/pages/AndruDonalds.jsx`
2. Agregar ruta en `App.jsx`:
   ```jsx
   <Route path="/andru-donalds" element={<AndruDonalds />} />
   ```
3. Activar link en `CelebrityCollaboration.jsx`:
   ```jsx
   <Link to="/andru-donalds" className="...">
     Explorar la Colección Privada →
   </Link>
   ```

### **Fase 2: Hero + Bio** (1 hora)
1. Implementar Hero section
2. Agregar biografía con texto real
3. Insertar imágenes disponibles

### **Fase 3: Conexión + Galería** (1 hora)
1. Sección de conexión con historia
2. Grid de galería con tus imágenes
3. Hover effects sutiles

### **Fase 4: CTA + Testing** (30 min)
1. Call to action final
2. Testing responsive
3. Optimización de imágenes

**Tiempo total:** ~3 horas

---

## 📸 Checklist de Imágenes

- [ ] **hero.jpg** - Foto principal de Andru (circular, 800x800)
- [ ] **bio.jpg** - Foto para biografía (landscape, 1200x800)
- [ ] **momento-01/02/03.jpg** - 3 fotos de conexión (600x400)
- [ ] **pieza-01/02/03.jpg** - Mínimo 3 piezas creadas (800x800)

**Optimización:**
- Formato: WebP
- Compresión: 80%
- Lazy loading: `loading="lazy"`

---

## 🔗 Integración

### En `App.jsx`:
```jsx
import AndruDonalds from './pages/AndruDonalds';

// En las rutas:
<Route path="/andru-donalds" element={<AndruDonalds />} />
```

### En `CelebrityCollaboration.jsx`:
```jsx
import { Link } from 'react-router-dom';

// Cambiar el botón disabled por:
<Link 
  to="/andru-donalds"
  className="inline-flex items-center gap-2 border border-yellow-600 text-yellow-600 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-yellow-50 transition-all"
  style={{ paddingLeft: '24px', paddingRight: '24px' }}
>
  Explorar la Colección Privada
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</Link>
```

---

## 📊 SEO (Minimalista)

```jsx
// En AndruDonalds.jsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>Andru Donalds & Enigma Artesanías | Colaboración Exclusiva</title>
  <meta name="description" content="Descubre la colaboración exclusiva entre Andru Donalds, voz de ENIGMA, y Enigma Artesanías. Piezas únicas desde 2022." />
</Helmet>
```

---

## ✅ Checklist Final

Antes de implementar:
- [ ] Recopilar todas las imágenes
- [ ] Optimizar imágenes (WebP, 80% calidad)
- [ ] Revisar textos de biografía
- [ ] Decidir cuántas piezas mostrar en galería
- [ ] Verificar links de redes sociales

---

## 💡 Principios Minimalistas

1. **Menos es más:** Solo 4-5 secciones
2. **Espacios en blanco:** Generosos márgenes y padding
3. **Tipografía clara:** Inter para todo (ya configurado)
4. **Colores limitados:** Gris + Amarillo + Blanco
5. **Animaciones sutiles:** Solo hover effects simples
6. **Un solo archivo:** Todo en `AndruDonalds.jsx`

---

**Estado:** ✅ Plan actualizado con stack real (Tailwind + React + Vite) y biografía auténtica de Andru Donalds

**Próximo paso:** Revisar el plan y comenzar implementación cuando estés listo 🚀
