import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
