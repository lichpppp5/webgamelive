import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-layout">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="main-content" style={{ minHeight: 'calc(100vh - var(--header-height) - 80px)' }}>
        <Outlet context={{ searchQuery }} />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
