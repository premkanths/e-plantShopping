import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem } from './CartSlice';
import './ProductQuickView.css';

function ProductQuickView({ plant, onClose }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const isInCart = cartItems.some(item => item.name === plant.name);

  const handleAddToCart = () => {
    dispatch(addItem(plant));
  };

  // Close when clicking outside of modal content
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container animate-fade-in">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-content">
          <div className="modal-image-sec">
            <img src={plant.image} alt={plant.name} className="modal-plant-image" />
            <div className="modal-badge-category">{plant.category}</div>
          </div>

          <div className="modal-details-sec">
            <div className="modal-header-info">
              <h2 className="modal-plant-name">{plant.name}</h2>
              <div className="modal-plant-price">{plant.cost}</div>
              <div className="modal-rating-container">
                <span className="rating-star">★</span>
                <span className="rating-val">{plant.rating || '4.5'}</span>
              </div>
            </div>

            <p className="modal-plant-description">{plant.description}</p>

            <div className="modal-divider"></div>

            <h3 className="modal-section-title">Plant Care & Specifications</h3>
            
            <div className="modal-spec-grid">
              <div className="spec-card">
                <div className="spec-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                  </svg>
                </div>
                <div className="spec-info">
                  <span className="spec-label">Sunlight</span>
                  <span className="spec-value">{plant.sunlight || 'Indirect Sunlight'}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"></path>
                  </svg>
                </div>
                <div className="spec-info">
                  <span className="spec-label">Water Needs</span>
                  <span className="spec-value">{plant.water || 'Once a week'}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="spec-info">
                  <span className="spec-label">Care Difficulty</span>
                  <span className="spec-value">{plant.difficulty || 'Beginner'}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <div className="spec-info">
                  <span className="spec-label">Mature Size</span>
                  <span className="spec-value">{plant.size || 'Medium (12" - 18")'}</span>
                </div>
              </div>
            </div>

            {plant.benefit && (
              <div className="benefit-alert">
                <div className="benefit-icon">🌿</div>
                <div>
                  <strong>Health & Air Benefit:</strong> {plant.benefit}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className={`modal-cart-btn ${isInCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                {isInCart ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button className="modal-close-outline-btn" onClick={onClose}>
                Back to Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductQuickView;
