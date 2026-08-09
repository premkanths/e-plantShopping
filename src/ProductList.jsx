import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem } from './CartSlice';
import CartItem from './CartItem';
import AboutUs from './AboutUs';
import './ProductList.css';

function ProductList() {
  const [showCart, setShowCart] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const plantsArray = [
    {
      category: "Air Purifying Plants",
      plants: [
        {
          name: "Snake Plant",
          image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=600&auto=format&fit=crop",
          description: "Produces oxygen at night, perfect for your bedroom.",
          cost: "$15"
        },
        {
          name: "Spider Plant",
          image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?q=80&w=600&auto=format&fit=crop",
          description: "Highly effective at filtering indoor air toxins.",
          cost: "$12"
        },
        {
          name: "Peace Lily",
          image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop",
          description: "Stunning white blooms that filter harmful chemicals.",
          cost: "$18"
        }
      ]
    },
    {
      category: "Aromatic Fragrant Plants",
      plants: [
        {
          name: "Lavender",
          image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=600&auto=format&fit=crop",
          description: "Calming scent that reduces stress and improves sleep.",
          cost: "$20"
        },
        {
          name: "Jasmine",
          image: "https://images.unsplash.com/photo-1508780709619-79562169bc51?q=80&w=600&auto=format&fit=crop",
          description: "Sweet fragrance that uplifts mood and relieves anxiety.",
          cost: "$22"
        },
        {
          name: "Rosemary",
          image: "https://images.unsplash.com/photo-1588610052317-02058b87ce2d?q=80&w=600&auto=format&fit=crop",
          description: "Delicious culinary herb with a fresh, piney aroma.",
          cost: "$10"
        }
      ]
    },
    {
      category: "Low Maintenance Plants",
      plants: [
        {
          name: "Aloe Vera",
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
          description: "Requires very little watering; contains soothing gel.",
          cost: "$14"
        },
        {
          name: "Cast Iron Plant",
          image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&auto=format&fit=crop",
          description: "Extremely hardy, thrives in low light and neglect.",
          cost: "$25"
        },
        {
          name: "ZZ Plant",
          image: "https://images.unsplash.com/photo-1632207691143-643c2a9a9361?q=80&w=600&auto=format&fit=crop",
          description: "Waxy, shiny leaves that store water for dry periods.",
          cost: "$19"
        }
      ]
    }
  ];

  const handleAddToCart = (plant) => {
    dispatch(addItem(plant));
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    setShowCart(true);
    setShowAbout(false);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setShowAbout(true);
    setShowCart(false);
  };

  const handlePlantsClick = (e) => {
    e.preventDefault();
    setShowCart(false);
    setShowAbout(false);
  };

  const handleContinueShopping = () => {
    setShowCart(false);
    setShowAbout(false);
  };

  return (
    <div className="product-list-container">
      <nav className="navbar">
        <div className="nav-logo" onClick={handlePlantsClick}>
          <span className="logo-icon">🌿</span>
          <div>
            <strong>Paradise Nursery</strong>
            <span style={{ fontSize: '0.8rem', display: 'block', fontWeight: 'normal', color: '#c8e6c9' }}>
              Green is Serenity
            </span>
          </div>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link-item" onClick={handlePlantsClick}>Plants</a>
          <a href="#" className="nav-link-item" onClick={handleAboutClick}>About Us</a>
          <div className="cart-icon-container" onClick={handleCartClick}>
            <a href="#" className="nav-link-item">
              <span className="cart-icon">🛒</span>
              {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
            </a>
          </div>
        </div>
      </nav>

      {showCart ? (
        <CartItem onContinueShopping={handleContinueShopping} />
      ) : showAbout ? (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <AboutUs />
        </div>
      ) : (
        <div className="catalog-container">
          <div className="catalog-header">
            <h2>Our Beautiful Plant Collection</h2>
            <p>Select your favorite companions to bring fresh air and positive vibes to your living space.</p>
          </div>

          {plantsArray.map((categoryGroup, index) => (
            <div key={index} className="category-section">
              <h3 className="category-title">{categoryGroup.category}</h3>
              <div className="plants-grid">
                {categoryGroup.plants.map((plant, pIndex) => {
                  const isInCart = cartItems.some(item => item.name === plant.name);
                  return (
                    <div key={pIndex} className="plant-card">
                      <div className="plant-img-container">
                        <img src={plant.image} alt={plant.name} className="plant-image" />
                      </div>
                      <div className="plant-details">
                        <h4 className="plant-name">{plant.name}</h4>
                        <p className="plant-price">{plant.cost}</p>
                        <p className="plant-desc">{plant.description}</p>
                        <button
                          className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
                          onClick={() => handleAddToCart(plant)}
                          disabled={isInCart}
                        >
                          {isInCart ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
