import React from 'react';
import './styles/styles.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

// Páginas
import Home from './pages/Home/Home';
import SobreMi from './pages/SobreMi/SobreMi';
import Contacto from './pages/Contacto/Contacto';
import PoliticasEnvios from './pages/PoliticasEnvios/PoliticasEnvios';
import ShippingPolicies from './pages/ShippingPolicies/ShippingPolicies';
import VideoShorts from './pages/VideoShorts';
import ElTaller from './pages/ElTaller/ElTaller';

// Importamos ProductGridPage (maneja el catálogo dinámico)
import ProductGridPage from './pages/ProductGridPage';

// Componentes
import Header from './components/Header/Header';
import Footer from './components/Footer';
import PublicCarousel from './components/PublicCarousel';
import ProductoDetalle from './components/ProductoDetalle';
import Tienda from './components/Tienda';
import WhatsAppButton from './components/WhatsAppButton';

// Autenticación
import SignUp from './components/SignUp';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Panel de administración
import AdminPanel from './components/AdminPanel';
import CarouselAdmin from './components/CarouselAdmin';
import CategoriaAdmin from './components/CategoriaAdmin';
import ProductoAdmin from './components/ProductoAdmin';

import Pedidos from './components/Pedidos';
import ReportePedidos from './components/ReportePedidos';
import ReporteCodigosQR from './components/ReporteCodigosQR';

// Módulo de Inventario
import InventarioHome from './modules/inventario/pages/InventarioHome';
import Produccion from './modules/inventario/pages/Produccion';
import ProduccionReporte from './modules/inventario/pages/ProduccionReporte';
import Ventas from './modules/inventario/pages/Ventas';
import Catalogo from './modules/inventario/pages/Catalogo';
import Compras from './modules/inventario/pages/Compras';
import Inventario from './modules/inventario/pages/Inventario';

import StockInicial from './modules/inventario/pages/StockInicial';
import ProductoForm from './modules/inventario/pages/ProductoForm';
import ProductoEdit from './modules/inventario/pages/ProductoEdit';
import NuevaVenta from './modules/ventas/pages/NuevaVenta';
import ReporteVentas from './modules/ventas/pages/ReporteVentas';
import Clientes from './modules/clientes/pages/Clientes';
import Proveedores from './modules/proveedores/pages/Proveedores';

// Módulo de Compras
import RegistroCompras from './modules/compras/pages/RegistroCompras';
import ReporteCompras from './modules/compras/pages/ReporteCompras';
import ProductosPendientes from './modules/compras/pages/ProductosPendientes';

// Módulo de Materiales
import RegistroMateriales from './modules/materiales/pages/RegistroMateriales';

const MainContent = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const isInventarioModule = location.pathname.startsWith('/inventario') ||
        location.pathname.startsWith('/produccion') ||
        location.pathname.startsWith('/ventas') ||
        location.pathname.startsWith('/catalogo-inventario') ||
        location.pathname.startsWith('/compras') ||
        location.pathname.startsWith('/clientes') ||
        location.pathname.startsWith('/proveedores') ||
        location.pathname.startsWith('/materiales') ||
        location.pathname.startsWith('/productos-pendientes') ||
        location.pathname.startsWith('/stock-inicial');

    const hideHeaderFooter = isAdmin || isInventarioModule;

    return (
        <>
            <ScrollToTop />
            {!hideHeaderFooter && <Header />}
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/sobremi" element={<SobreMi />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/politicasenvios" element={<PoliticasEnvios />} />
                <Route path="/shippingpolicies" element={<ShippingPolicies />} />
                <Route path="/videoshorts" element={<VideoShorts />} />
                <Route path="/el-taller" element={<ElTaller />} />
                <Route path="/carrusel" element={<PublicCarousel />} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/tienda" element={<Tienda />} />

                {/* Rutas dinámicas de ProductGridPage */}
                <Route path="/catalogo/:material/:categoria" element={<ProductGridPage />} />

                {/* Rutas de autenticación */}
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />

                {/* Panel de administración - Rutas privadas */}
                <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
                <Route path="/admin/carrusel" element={<PrivateRoute><CarouselAdmin /></PrivateRoute>} />
                <Route path="/admin/categoria" element={<PrivateRoute><CategoriaAdmin /></PrivateRoute>} />
                <Route path="/admin/productos" element={<PrivateRoute><ProductoAdmin /></PrivateRoute>} />

                <Route path="/admin/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
                <Route path="/admin/reportes" element={<PrivateRoute><ReportePedidos /></PrivateRoute>} />
                <Route path="/admin/codigos-qr" element={<PrivateRoute><ReporteCodigosQR /></PrivateRoute>} />

                {/* Módulo de Inventario - Rutas privadas */}
                <Route path="/inventario-home" element={<PrivateRoute><InventarioHome /></PrivateRoute>} />
                <Route path="/produccion" element={<PrivateRoute><Produccion /></PrivateRoute>} />
                <Route path="/produccion-reporte" element={<PrivateRoute><ProduccionReporte /></PrivateRoute>} />
                <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
                <Route path="/catalogo-inventario" element={<PrivateRoute><Catalogo /></PrivateRoute>} />
                <Route path="/compras" element={<PrivateRoute><Compras /></PrivateRoute>} />
                <Route path="/compras/nuevo" element={<PrivateRoute><RegistroCompras /></PrivateRoute>} />
                <Route path="/compras/reporte" element={<PrivateRoute><ReporteCompras /></PrivateRoute>} />
                <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
                <Route path="/stock-inicial" element={<PrivateRoute><StockInicial /></PrivateRoute>} />
                <Route path="/inventario/nuevo" element={<PrivateRoute><ProductoForm /></PrivateRoute>} />
                <Route path="/inventario/editar/:id" element={<PrivateRoute><ProductoEdit /></PrivateRoute>} />
                <Route path="/ventas/nueva" element={<PrivateRoute><NuevaVenta /></PrivateRoute>} />
                <Route path="/ventas/reporte" element={<PrivateRoute><ReporteVentas /></PrivateRoute>} />
                <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
                <Route path="/materiales" element={<PrivateRoute><RegistroMateriales /></PrivateRoute>} />
                <Route path="/productos-pendientes" element={<PrivateRoute><ProductosPendientes /></PrivateRoute>} />
            </Routes>
            {!hideHeaderFooter && (
                <>
                    <WhatsAppButton />
                    <Footer />
                </>
            )}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <MainContent />
            </Router>
        </AuthProvider>
    );
}

export default App;