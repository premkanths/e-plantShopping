import React from 'react';

function AboutUs() {
  return (
    <div className="about-us-container" style={{
      padding: '30px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      color: '#2e7d32',
      textAlign: 'center',
      marginTop: '20px'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>About Us</h2>
      <p className="about-us-description" style={{
        fontWeight: 'bold',
        fontSize: '1.25rem',
        color: '#1b5e20',
        marginBottom: '20px'
      }}>
        Welcome to Paradise Nursery, where green meets serenity!
      </p>
      <p className="about-us-content" style={{
        fontSize: '1.05rem',
        lineHeight: '1.6',
        color: '#424242',
        marginBottom: '15px'
      }}>
        At Paradise Nursery, we are passionate about bringing nature closer to you. Our mission is to provide a wide range of high-quality plants that not only enhance the beauty of your surroundings but also contribute to a healthier and more sustainable lifestyle.
      </p>
      <p className="about-us-content" style={{
        fontSize: '1.05rem',
        lineHeight: '1.6',
        color: '#424242',
        marginBottom: '15px'
      }}>
        From air-purifying houseplants to aromatic fragrant herbs, we carefully select and nurture each plant to ensure they arrive at your home healthy and vibrant. Our team of plant experts is always ready to guide you through your plant parenting journey.
      </p>
      <p className="about-us-content" style={{
        fontSize: '1.05rem',
        lineHeight: '1.6',
        color: '#424242'
      }}>
        Join us in making the world a greener, fresher place, one room at a time. Explore our collection and find the perfect plant companion today!
      </p>
    </div>
  );
}

export default AboutUs;
