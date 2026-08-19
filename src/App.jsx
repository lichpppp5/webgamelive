import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Docs from './pages/Docs';
import DocDetail from './pages/DocDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin-ad" element={<Admin />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:id" element={<DocDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
