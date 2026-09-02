import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from './userSlice';
import { fetchPlants } from './catalogSlice';
import { fetchOrders } from './orderSlice';
import { fetchCurrentUser, logoutUser } from './authSlice';
import ProductList from './ProductList';
import CartItem from './CartItem';
import Checkout from './Checkout';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import AboutUs from './AboutUs';
import Login from './Login';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const [showProductList, setShowProductList] = useState(false);
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog', 'about', 'cart', 'checkout', 'profile', 'admin', 'login'
  const [toasts, setToasts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get Redux auth states
  const { isAuthenticated, user: currentUser } = useSelector(state => state.auth);
  const userRole = currentUser?.role || 'customer';
  const cartItems = useSelector(state => state.cart.items);
  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load catalog and check authentication session on mount
  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchPlants());
  }, [dispatch]);

  // Load orders and user profile when logged in
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  // Protect routes from unauthenticated users and redirect from login on auth
  useEffect(() => {
    if (!isAuthenticated && ['checkout', 'profile', 'admin'].includes(currentView)) {
      setCurrentView('login');
    } else if (isAuthenticated && currentView === 'login') {
      setCurrentView(userRole === 'admin' ? 'admin' : 'catalog');
    }
  }, [isAuthenticated, userRole, currentView]);

  // Toast Notification Helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleGetStartedClick = () => {
    setShowProductList(true);
    setCurrentView('catalog');
    showToast("Welcome to Paradise Nursery!");
  };

  return (
    <div className="app-container">
      {/* 1. LANDING PAGE VIEW */}
      {!showProductList ? (
        <div className="landing-page">
          <div className="landing-content">
            <h1 className="landing-title">Paradise Nursery</h1>
            <div className="divider"></div>
            <p className="landing-subtitle">
              Welcome to Paradise Nursery, where green meets serenity! We offer a wide range of beautiful, healthy houseplants to clean the air, fragrance your home, and decorate your living spaces.
            </p>
            <button className="get-started-btn" onClick={handleGetStartedClick}>
              Get Started
            </button>
          </div>
        </div>
      ) : (
        /* 2. MAIN APPLICATION WORKSPACE */
        <div className="main-workspace">
          {/* Header/Navbar */}
          <nav className="navbar">
            <div className="nav-logo" onClick={() => setCurrentView('catalog')}>
              <span className="logo-icon">🌿</span>
              <div>
                <strong>Paradise Nursery</strong>
                <span style={{ fontSize: '0.8rem', display: 'block', fontWeight: 'normal', color: '#c8e6c9', fontFamily: 'Inter, sans-serif' }}>
                  Green is Serenity
                </span>
              </div>
            </div>

            {/* Navigation links based on active role (Desktop) */}
            <div className="nav-links-wrapper desktop-nav">
              <div className="nav-links">
                {userRole === 'customer' ? (
                  <>
                    <span 
                      className={`nav-link-item ${currentView === 'catalog' ? 'active' : ''}`} 
                      onClick={() => navigateTo('catalog')}
                    >
                      Shop Plants
                    </span>
                    <span 
                      className={`nav-link-item ${currentView === 'about' ? 'active' : ''}`} 
                      onClick={() => navigateTo('about')}
                    >
                      About Us
                    </span>
                    <span 
                      className={`nav-link-item ${currentView === 'profile' ? 'active' : ''}`} 
                      onClick={() => navigateTo('profile')}
                    >
                      My Profile
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      className={`nav-link-item ${currentView === 'admin' ? 'active' : ''}`} 
                      onClick={() => navigateTo('admin')}
                    >
                      Dashboard
                    </span>
                    <span 
                      className={`nav-link-item ${currentView === 'catalog' ? 'active' : ''}`} 
                      onClick={() => navigateTo('catalog')}
                    >
                      Catalog Preview
                    </span>
                  </>
                )}
              </div>

              {/* Auth Controls in Navbar */}
              <div className="auth-navbar-widget">
                {isAuthenticated ? (
                  <div className="user-nav-info">
                    <span className="user-nav-name">👤 {currentUser?.name || 'User'}</span>
                    <button 
                      className="logout-btn"
                      onClick={() => {
                        dispatch(logoutUser());
                        navigateTo('catalog');
                        showToast("Signed out successfully.");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    className="login-nav-btn"
                    onClick={() => navigateTo('login')}
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Cart Icon (Customer view only) */}
              {userRole === 'customer' && (
                <div className="cart-icon-container" onClick={() => navigateTo('cart')}>
                  <span className="nav-link-item">
                    <span className="cart-icon">🛒</span>
                    {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Header Controls (Cart + Hamburger) */}
            <div className="mobile-header-controls">
              {userRole === 'customer' && (
                <div className="cart-icon-container mobile-cart-icon" onClick={() => navigateTo('cart')}>
                  <span className="nav-link-item">
                    <span className="cart-icon">🛒</span>
                    {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
                  </span>
                </div>
              )}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>

            {/* Mobile Slide-down Navigation Drawer */}
            {isMobileMenuOpen && (
              <div className="mobile-nav-drawer animate-fade-in">
                <div className="mobile-user-status">
                  {isAuthenticated ? (
                    <div className="mobile-user-card">
                      <span>👤 Signed in as <strong>{currentUser?.name || 'User'}</strong> ({userRole})</span>
                    </div>
                  ) : (
                    <button className="mobile-login-btn" onClick={() => navigateTo('login')}>
                      🔑 Sign In / Register
                    </button>
                  )}
                </div>

                <div className="mobile-nav-links">
                  {userRole === 'customer' ? (
                    <>
                      <button 
                        className={`mobile-nav-item ${currentView === 'catalog' ? 'active' : ''}`}
                        onClick={() => navigateTo('catalog')}
                      >
                        🌿 Shop 64 Plants
                      </button>
                      <button 
                        className={`mobile-nav-item ${currentView === 'about' ? 'active' : ''}`}
                        onClick={() => navigateTo('about')}
                      >
                        📖 About Our Nursery
                      </button>
                      <button 
                        className={`mobile-nav-item ${currentView === 'profile' ? 'active' : ''}`}
                        onClick={() => navigateTo('profile')}
                      >
                        ❤️ My Profile & Wishlist
                      </button>
                      <button 
                        className={`mobile-nav-item ${currentView === 'cart' ? 'active' : ''}`}
                        onClick={() => navigateTo('cart')}
                      >
                        🛒 Shopping Cart ({totalItemsCount})
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className={`mobile-nav-item ${currentView === 'admin' ? 'active' : ''}`}
                        onClick={() => navigateTo('admin')}
                      >
                        📊 Merchant Dashboard
                      </button>
                      <button 
                        className={`mobile-nav-item ${currentView === 'catalog' ? 'active' : ''}`}
                        onClick={() => navigateTo('catalog')}
                      >
                        👁️ Live Catalog Preview
                      </button>
                    </>
                  )}

                  {isAuthenticated && (
                    <button 
                      className="mobile-logout-btn"
                      onClick={() => {
                        dispatch(logoutUser());
                        navigateTo('catalog');
                        showToast("Signed out successfully.");
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* Page Routing */}
          <div className="view-pane">
            {currentView === 'catalog' && (
              <ProductList 
                onAddToCartClick={(name) => showToast(`🛒 Added "${name}" to your shopping cart!`)}
              />
            )}
            
            {currentView === 'about' && (
              <div className="container" style={{ minHeight: '60vh' }}>
                <AboutUs />
              </div>
            )}
            
            {currentView === 'cart' && (
              <CartItem 
                onContinueShopping={() => setCurrentView('catalog')} 
                onCheckoutClick={() => setCurrentView('checkout')}
              />
            )}
            
            {currentView === 'checkout' && (
              <Checkout 
                onOrderCompleted={() => {
                  setCurrentView('profile');
                  showToast("🎉 Order placed successfully! Invoice generated.");
                }}
                onCancel={() => setCurrentView('cart')}
              />
            )}

            {currentView === 'profile' && (
              <UserProfile 
                onContinueShopping={() => setCurrentView('catalog')}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard />
            )}

            {currentView === 'login' && (
              <Login 
                onLoginSuccess={() => {
                  const role = currentUser?.role || 'customer';
                  setCurrentView(role === 'admin' ? 'admin' : 'catalog');
                  showToast("Signed in successfully!");
                }}
              />
            )}
          </div>

          {/* Footer */}
          <footer className="footer-sec no-print">
            <div className="footer-grid">
              <div className="footer-about">
                <h3>Paradise Nursery</h3>
                <p>Welcome to Paradise Nursery, where green meets serenity! We are dedicated to providing the healthiest, premium indoor air-purifying, aromatic, and low-maintenance house companions.</p>
              </div>
              <div className="footer-links">
                <h4>Quick Links</h4>
                <ul>
                  <li><a onClick={() => { setCurrentView('catalog'); window.scrollTo(0,0); }}>Shop Plants</a></li>
                  <li><a onClick={() => { setCurrentView('about'); window.scrollTo(0,0); }}>Our History</a></li>
                  <li><a onClick={() => { setCurrentView('profile'); window.scrollTo(0,0); }}>My Wishlist</a></li>
                  <li><a onClick={() => handleRoleChange(userRole === 'admin' ? 'customer' : 'admin')}>Simulation Center</a></li>
                </ul>
              </div>
              <div className="footer-contact">
                <h4>Location & Contact</h4>
                <p>📍 Bangalore</p>
                <p>📞 8088113122</p>
                <p>✉️ premkanthks@gmail.com</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2026 Paradise Nursery Shop. All rights reserved. Developed for Merchant Sale Portfolio.</p>
            </div>
          </footer>
        </div>
      )}

      {/* Floating Toast Notification Containers */}
      <div className="toast-container no-print">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-message">
            <span>{toast.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
