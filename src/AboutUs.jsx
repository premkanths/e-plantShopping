import React from 'react';

function AboutUs() {
  return (
    <div className="container">
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: 'clamp(24px, 5vw, 45px)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid #eef2ec',
        textAlign: 'center',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header Title */}
        <span style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-block',
          marginBottom: '14px'
        }}>
          🌿 About Our Botanical Mission
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          color: '#1b5e20',
          margin: '0 0 16px 0',
          fontWeight: 700
        }}>
          Where Green Meets Serenity
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          lineHeight: '1.7',
          color: '#4a5d4d',
          maxWidth: '750px',
          margin: '0 auto 35px auto'
        }}>
          At <strong>Paradise Nursery</strong>, we believe every home, patio, and office deserves the calming vitality of living plants. From air-purifying foliage and exotic orchids to resilient succulents and traditional bonsai trees, we cultivate botanical happiness one doorstep at a time.
        </p>

        {/* 4 Feature Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          margin: '35px 0',
          textAlign: 'left'
        }}>
          <div style={{
            background: '#fafcfa',
            padding: '22px',
            borderRadius: '16px',
            border: '1px solid #eef2eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌱</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#1b5e20', fontSize: '1.1rem' }}>64 Curated Species</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', lineHeight: '1.5' }}>
              Hand-nurtured botanical selections across 8 diverse indoor & outdoor categories.
            </p>
          </div>

          <div style={{
            background: '#fafcfa',
            padding: '22px',
            borderRadius: '16px',
            border: '1px solid #eef2eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#1b5e20', fontSize: '1.1rem' }}>Eco-Safe Delivery</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', lineHeight: '1.5' }}>
              Custom insulated, 100% recyclable packaging ensures zero damage during transit.
            </p>
          </div>

          <div style={{
            background: '#fafcfa',
            padding: '22px',
            borderRadius: '16px',
            border: '1px solid #eef2eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#1b5e20', fontSize: '1.1rem' }}>30-Day Guarantee</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', lineHeight: '1.5' }}>
              Arrives healthy and thriving or we replace your plant at zero additional cost.
            </p>
          </div>

          <div style={{
            background: '#fafcfa',
            padding: '22px',
            borderRadius: '16px',
            border: '1px solid #eef2eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🩺</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#1b5e20', fontSize: '1.1rem' }}>Expert Care Guides</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', lineHeight: '1.5' }}>
              Detailed sunlight, water, and soil instructions included with every plant order.
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '15px',
          background: '#f1f8e9',
          padding: '24px 16px',
          borderRadius: '18px',
          border: '1px solid #c8e6c9',
          marginTop: '30px'
        }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b5e20' }}>64+</div>
            <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Botanical Varieties</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b5e20' }}>15,000+</div>
            <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Happy Plant Parents</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b5e20' }}>99.8%</div>
            <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Vibrant Arrival Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b5e20' }}>100%</div>
            <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>Eco-Conscious</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
