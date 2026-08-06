import './HeroBanner.css';

const HeroBanner = () => {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h2>Công Cụ & Giải Pháp MMO Hàng Đầu</h2>
        <p>Tối ưu hóa thời gian và gia tăng hiệu suất công việc với kho công cụ, game tương tác đa dạng tại TOOLLIVE.</p>
        <button className="btn-primary" style={{marginTop: '1rem'}}>Khám phá ngay</button>
      </div>
      <div className="hero-image-wrapper">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop" 
          alt="Hero" 
          className="hero-img"
        />
      </div>
    </div>
  );
};

export default HeroBanner;
