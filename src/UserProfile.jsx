import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist, updateProfile } from './userSlice';
import { addItem } from './CartSlice';
import './UserProfile.css';

function UserProfile({ onContinueShopping }) {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
  const wishlistNames = useSelector(state => state.user.wishlist);
  const catalogItems = useSelector(state => state.catalog.items);
  const allOrders = useSelector(state => state.orders.items);
  const cartItems = useSelector(state => state.cart.items);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'wishlist', 'settings'
  const [profileForm, setProfileForm] = useState({
    name: profile.name || '',
    email: profile.email || '',
    street: profile.shippingAddress?.street || '',
    city: profile.shippingAddress?.city || '',
    state: profile.shippingAddress?.state || '',
    zip: profile.shippingAddress?.zip || '',
  });

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter products that are in the user's wishlist
  const wishlistItems = catalogItems.filter(item => wishlistNames.includes(item.name));

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      shippingAddress: {
        street: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zip: profileForm.zip,
      }
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddToCart = (plant) => {
    dispatch(addItem(plant));
  };

  const handleRemoveWishlist = (name) => {
    dispatch(toggleWishlist(name));
  };

  const parseCost = (costStr) => parseFloat(costStr.replace('$', ''));

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header">
        <div className="profile-avatar-large">JD</div>
        <div className="profile-title-group">
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <span className="profile-role-badge">Customer Account</span>
        </div>
      </div>

      <div className="profile-nav-tabs">
        <button 
          className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Order History ({allOrders.length})
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          ❤️ My Wishlist ({wishlistItems.length})
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Address & Settings
        </button>
      </div>

      <div className="profile-tab-content">
        {/* ORDER HISTORY TAB */}
        {activeTab === 'orders' && (
          <div className="orders-tab-view animate-fade-in">
            {allOrders.length === 0 ? (
              <div className="profile-empty-state">
                <div className="empty-state-icon">🛍️</div>
                <h3>No Orders Yet</h3>
                <p>You haven't purchased any plant companions yet.</p>
                <button className="co-btn-primary" onClick={onContinueShopping}>Start Shopping</button>
              </div>
            ) : (
              <div className="orders-list">
                {allOrders.map((order, idx) => (
                  <div key={idx} className="order-profile-card">
                    <div className="order-p-header">
                      <div>
                        <span className="order-p-id">Order ID: {order.id}</span>
                        <span className="order-p-date">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`status-badge-co ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-p-body">
                      <div className="order-p-plants-pics">
                        {order.items.slice(0, 3).map((item, pIdx) => (
                          <div key={pIdx} className="order-pic-thumbnail-container">
                            <img src={item.image} alt={item.name} className="order-pic-thumbnail" />
                            <span className="order-p-qty-badge">{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="order-pic-more">+{order.items.length - 3} more</div>
                        )}
                      </div>

                      <div className="order-p-meta-info">
                        <div>
                          <strong>Shipped to:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}
                        </div>
                        <div>
                          <strong>Total Paid:</strong> <span className="order-price-bold">${order.totalAmount}</span>
                        </div>
                      </div>

                      <button 
                        className="view-order-receipt-btn"
                        onClick={() => setSelectedReceipt(order)}
                      >
                        📄 View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-tab-view animate-fade-in">
            {wishlistItems.length === 0 ? (
              <div className="profile-empty-state">
                <div className="empty-state-icon">❤️</div>
                <h3>Wishlist is Empty</h3>
                <p>Save your favorite green friends to buy them later.</p>
                <button className="co-btn-primary" onClick={onContinueShopping}>Explore Catalog</button>
              </div>
            ) : (
              <div className="profile-wishlist-grid">
                {wishlistItems.map((plant, index) => {
                  const isAlreadyInCart = cartItems.some(item => item.name === plant.name);
                  return (
                    <div key={index} className="wishlist-card">
                      <div className="wishlist-img-wrapper">
                        <img src={plant.image} alt={plant.name} className="wishlist-img" />
                        <button 
                          className="wishlist-remove-icon-btn"
                          onClick={() => handleRemoveWishlist(plant.name)}
                          title="Remove from Wishlist"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="wishlist-details">
                        <h4>{plant.name}</h4>
                        <span className="wishlist-category">{plant.category}</span>
                        <div className="wishlist-price-row">
                          <span className="wishlist-price">{plant.cost}</span>
                          <button 
                            className={`wishlist-cart-btn ${isAlreadyInCart ? 'added' : ''}`}
                            onClick={() => handleAddToCart(plant)}
                            disabled={isAlreadyInCart}
                          >
                            {isAlreadyInCart ? 'Added' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADDRESS & SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="settings-tab-view animate-fade-in">
            <form onSubmit={handleProfileSubmit} className="profile-settings-form">
              <h3 className="settings-section-title">Delivery & Personal Details</h3>
              {saveSuccess && (
                <div className="success-toast-banner">
                  ✓ Profile settings updated and saved to local database!
                </div>
              )}

              <div className="settings-form-row">
                <div className="form-group-co">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileChange} 
                    required
                  />
                </div>
                <div className="form-group-co">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange} 
                    required
                  />
                </div>
              </div>

              <div className="form-group-co full-width">
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="street" 
                  value={profileForm.street} 
                  onChange={handleProfileChange} 
                  required
                />
              </div>

              <div className="settings-form-row three-col">
                <div className="form-group-co">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={profileForm.city} 
                    onChange={handleProfileChange} 
                    required
                  />
                </div>
                <div className="form-group-co">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={profileForm.state} 
                    onChange={handleProfileChange} 
                    required
                  />
                </div>
                <div className="form-group-co">
                  <label>Zip Code</label>
                  <input 
                    type="text" 
                    name="zip" 
                    value={profileForm.zip} 
                    onChange={handleProfileChange} 
                    required
                  />
                </div>
              </div>

              <div className="settings-actions">
                <button type="submit" className="settings-save-btn">
                  Save Address & Info
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* RECEIPT MODAL OVERLAY */}
      {selectedReceipt && (
        <div className="receipt-modal-overlay" onClick={(e) => e.target.className === 'receipt-modal-overlay' && setSelectedReceipt(null)}>
          <div className="receipt-modal-content">
            <button className="receipt-modal-close" onClick={() => setSelectedReceipt(null)}>
              ✕
            </button>
            <div className="receipt-paper" style={{ boxShadow: 'none', padding: '10px' }}>
              <div className="receipt-header">
                <div className="receipt-brand">
                  <span className="logo-icon-receipt">🌿</span>
                  <div>
                    <h2>Paradise Nursery</h2>
                    <span>Green is Serenity</span>
                  </div>
                </div>
                <div className="receipt-meta">
                  <h1>RECEIPT</h1>
                  <div><strong>Order ID:</strong> {selectedReceipt.id}</div>
                  <div><strong>Date:</strong> {new Date(selectedReceipt.date).toLocaleString()}</div>
                </div>
              </div>
              
              <hr className="receipt-divider" />

              <div className="receipt-addresses">
                <div className="address-col">
                  <h3>Customer Shipping</h3>
                  <p>
                    <strong>{selectedReceipt.customerName}</strong><br />
                    {selectedReceipt.shippingAddress.street}<br />
                    {selectedReceipt.shippingAddress.city}, {selectedReceipt.shippingAddress.state} {selectedReceipt.shippingAddress.zip}<br />
                    Phone: {selectedReceipt.customerPhone}<br />
                    Email: {selectedReceipt.customerEmail}
                  </p>
                </div>
                <div className="address-col">
                  <h3>Sold By</h3>
                  <p>
                    <strong>Paradise Nursery Shop</strong><br />
                    555 Greenery Way<br />
                    Plant Hills, CO 80211
                  </p>
                </div>
              </div>

              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="align-center">Qty</th>
                    <th className="align-right">Unit Cost</th>
                    <th className="align-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="align-center">{item.quantity}</td>
                      <td className="align-right">{item.cost}</td>
                      <td className="align-right">${(parseCost(item.cost) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-summary-totals">
                <div className="totals-table-receipt">
                  <div className="totals-tr">
                    <span>Subtotal:</span>
                    <span>${selectedReceipt.subtotal}</span>
                  </div>
                  <div className="totals-tr">
                    <span>Taxes (8%):</span>
                    <span>${selectedReceipt.tax}</span>
                  </div>
                  <div className="totals-tr">
                    <span>Shipping:</span>
                    <span>{parseFloat(selectedReceipt.shippingFee) === 0 ? 'FREE' : `$${selectedReceipt.shippingFee}`}</span>
                  </div>
                  <hr />
                  <div className="totals-tr grand-total-tr">
                    <span>Grand Total Paid:</span>
                    <span>${selectedReceipt.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
