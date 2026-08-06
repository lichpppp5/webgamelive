const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-darker)', padding: '2rem 0', marginTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} TOOLLIVE. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Chuyên cung cấp game và tool tương tác chất lượng cao.</p>
      </div>
    </footer>
  );
};

export default Footer;
