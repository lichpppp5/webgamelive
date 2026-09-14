import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Docs from './pages/Docs';
import DocDetail from './pages/DocDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Maintenance from './pages/Maintenance';
import { useSettings } from './context/AppContext';

function App() {
  const { contactSettings } = useSettings();
  const location = useLocation();

  const isMaintenanceMode = contactSettings?.maintenanceMode === 'true';
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isMaintenanceMode && !isAdminRoute) {
    return <Maintenance />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="software" element={<Home defaultCategory="phan-mem" />} />
        <Route path="phan-mem" element={<Home defaultCategory="phan-mem" />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin-ad" element={<Admin />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:id" element={<DocDetail />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
}

export default App;
