import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, updateProduct, deleteProduct, resetCatalog } from './catalogSlice';
import { updateOrderStatus, fetchOrders } from './orderSlice';
import './AdminDashboard.css';

function AdminDashboard() {
  const dispatch = useDispatch();
  const catalog = useSelector(state => state.catalog.items);
  const orders = useSelector(state => state.orders.items);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'inventory', 'orders'
  
  // Inventory form state (Add/Edit)
  const [editingProduct, setEditingProduct] = useState(null); // null means Add mode, object means Edit mode
  const [productForm, setProductForm] = useState({
    name: '',
    cost: '',
    image: '',
    category: 'Air Purifying',
    description: '',
    sunlight: '',
    water: '',
    difficulty: 'Easy',
    size: '',
    benefit: ''
  });

  const [formError, setFormError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // 1. CALCULATE ANALYTICS
  const totalRevenue = orders.reduce((sum, ord) => sum + parseFloat(ord.totalAmount), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(ord => ord.customerEmail)).size;
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Best selling plants mapping
  const plantSales = {};
  orders.forEach(ord => {
    ord.items.forEach(item => {
      plantSales[item.name] = (plantSales[item.name] || 0) + item.quantity;
    });
  });
  const bestSellers = Object.keys(plantSales)
    .map(name => ({ name, quantity: plantSales[name] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Form input handler
  const handleInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleCostBlur = (e) => {
    let val = e.target.value;
    if (val && !val.startsWith('$')) {
      setProductForm({ ...productForm, cost: `$${val}` });
    }
  };

  // Submit Add or Edit Product
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.cost || !productForm.image || !productForm.description) {
      setFormError('Name, Cost, Image URL, and Description are required.');
      return;
    }
    setFormError('');

    if (editingProduct) {
      // Edit mode
      dispatch(updateProduct({
        id: editingProduct.id,
        ...productForm
      }));
      showActionMessage('Product updated successfully!');
      setEditingProduct(null);
    } else {
      // Add mode
      dispatch(addProduct(productForm));
      showActionMessage('Product added to catalog!');
    }

    // Reset Form
    setProductForm({
      name: '',
      cost: '',
      image: '',
      category: 'Air Purifying',
      description: '',
      sunlight: '',
      water: '',
      difficulty: 'Easy',
      size: '',
      benefit: ''
    });
  };

  const showActionMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      cost: product.cost,
      image: product.image,
      category: product.category,
      description: product.description,
      sunlight: product.sunlight || '',
      water: product.water || '',
      difficulty: product.difficulty || 'Easy',
      size: product.size || '',
      benefit: product.benefit || ''
    });
    setActiveTab('inventory'); // jump to form if not there
  };

  const handleDeleteClick = (productId) => {
    if (window.confirm('Are you sure you want to delete this product? It will be removed from catalog.')) {
      dispatch(deleteProduct(productId));
      showActionMessage('Product deleted successfully.');
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog to original plant database? This will clear all your custom additions/edits.')) {
      dispatch(resetCatalog());
      showActionMessage('Catalog restored to default settings.');
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
    showActionMessage(`Order ${orderId} status set to ${newStatus}`);
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <div>
          <h2>Merchant Dashboard</h2>
          <p className="admin-subtitle">Paradise Nursery Management Portal</p>
        </div>
        <button className="reset-catalog-btn-admin" onClick={handleResetCatalog}>
          🔄 Reset Default Catalog
        </button>
      </div>

      {actionMessage && (
        <div className="admin-toast-banner animate-fade-in">
          ✓ {actionMessage}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Shop Analytics
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('inventory');
            if (!editingProduct) {
              setProductForm({
                name: '', cost: '', image: '', category: 'Air Purifying',
                description: '', sunlight: '', water: '', difficulty: 'Easy', size: '', benefit: ''
              });
            }
          }}
        >
          🌿 Inventory Manager
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Order Fulfilment ({orders.length})
        </button>
      </div>

      <div className="admin-tab-panel">
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="analytics-view animate-fade-in">
            {/* Stat Counters */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Revenue</span>
                <h3 className="stat-value">${totalRevenue.toFixed(2)}</h3>
                <span className="stat-change positive">↗ Mock Sales Data</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Orders</span>
                <h3 className="stat-value">{totalOrders}</h3>
                <span className="stat-change">Active Customers</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Average Order Value</span>
                <h3 className="stat-value">${averageOrderValue.toFixed(2)}</h3>
                <span className="stat-change positive">Standard basket</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Unique Customers</span>
                <h3 className="stat-value">{uniqueCustomers}</h3>
                <span className="stat-change">Registration rate 100%</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-flex-row">
              <div className="chart-wrapper">
                <h4>Popular Plants Sold</h4>
                {bestSellers.length === 0 ? (
                  <p className="no-data-txt">No plants sold yet. Make a purchase to see sales stats!</p>
                ) : (
                  <div className="custom-bar-chart">
                    {bestSellers.map((item, idx) => (
                      <div key={idx} className="chart-bar-row">
                        <span className="bar-label">{item.name}</span>
                        <div className="bar-outer">
                          <div 
                            className="bar-inner" 
                            style={{ width: `${(item.quantity / bestSellers[0].quantity) * 100}%` }}
                          >
                            <span className="bar-inner-qty">{item.quantity} sold</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="chart-wrapper">
                <h4>Estimated Monthly Revenues</h4>
                <div className="custom-line-chart">
                  {/* Styled dummy timeline of nursery revenue */}
                  <div className="timeline-labels">
                    <div className="timeline-node"><strong>Mar:</strong> $1,250</div>
                    <div className="timeline-node"><strong>Apr:</strong> $1,890</div>
                    <div className="timeline-node"><strong>May:</strong> $2,420</div>
                    <div className="timeline-node"><strong>Jun:</strong> $3,100</div>
                    <div className="timeline-node"><strong>Jul:</strong> $3,950</div>
                    <div className="timeline-node">
                      <strong>Aug:</strong> ${(4500 + totalRevenue).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      <span className="live-pill">LIVE</span>
                    </div>
                  </div>
                  <div className="botanical-growth-svg">
                    <svg viewBox="0 0 500 120" className="growth-svg">
                      <path 
                        d="M0,100 Q100,80 200,65 T400,30 T500,10" 
                        fill="none" 
                        stroke="#2e7d32" 
                        strokeWidth="3"
                        strokeDasharray="4"
                      />
                      <circle cx="100" cy="80" r="4" fill="#1b5e20" />
                      <circle cx="200" cy="65" r="4" fill="#1b5e20" />
                      <circle cx="300" cy="50" r="4" fill="#1b5e20" />
                      <circle cx="400" cy="30" r="4" fill="#1b5e20" />
                      <circle cx="500" cy="10" r="6" fill="#81c784" />
                    </svg>
                  </div>
                  <p className="chart-sub-note">Botanical Sales peak during Spring and Summer quarters.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY MANAGER TAB */}
        {activeTab === 'inventory' && (
          <div className="inventory-view animate-fade-in">
            <div className="inventory-grid-row">
              {/* Product Form Panel */}
              <div className="product-form-card">
                <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Plant Product'}</h3>
                <form onSubmit={handleProductSubmit} className="admin-product-form">
                  {formError && <div className="form-error-banner">{formError}</div>}
                  
                  <div className="form-row-admin">
                    <div className="form-group-co">
                      <label>Plant Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={productForm.name} 
                        onChange={handleInputChange} 
                        placeholder="E.g. Swiss Cheese Plant"
                      />
                    </div>
                    <div className="form-group-co">
                      <label>Price * (E.g. $15)</label>
                      <input 
                        type="text" 
                        name="cost" 
                        value={productForm.cost} 
                        onChange={handleInputChange} 
                        onBlur={handleCostBlur}
                        placeholder="E.g. $18"
                      />
                    </div>
                  </div>

                  <div className="form-row-admin">
                    <div className="form-group-co">
                      <label>Category *</label>
                      <select name="category" value={productForm.category} onChange={handleInputChange}>
                        <option value="Air Purifying">Air Purifying</option>
                        <option value="Aromatic Fragrant">Aromatic Fragrant</option>
                        <option value="Low Maintenance">Low Maintenance</option>
                      </select>
                    </div>
                    <div className="form-group-co">
                      <label>Image URL *</label>
                      <input 
                        type="text" 
                        name="image" 
                        value={productForm.image} 
                        onChange={handleInputChange} 
                        placeholder="https://unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="form-group-co full-width">
                    <label>Description *</label>
                    <textarea 
                      name="description" 
                      value={productForm.description} 
                      onChange={handleInputChange}
                      placeholder="Enter details about plant beauty and placements..."
                      rows="3"
                    />
                  </div>

                  <h4 className="form-sub-header">Care Guide / Technical Specifications (Optional)</h4>

                  <div className="form-row-admin">
                    <div className="form-group-co">
                      <label>Sunlight Preference</label>
                      <input 
                        type="text" 
                        name="sunlight" 
                        value={productForm.sunlight} 
                        onChange={handleInputChange} 
                        placeholder="E.g. Indirect shade"
                      />
                    </div>
                    <div className="form-group-co">
                      <label>Watering Schedule</label>
                      <input 
                        type="text" 
                        name="water" 
                        value={productForm.water} 
                        onChange={handleInputChange} 
                        placeholder="E.g. Once a month"
                      />
                    </div>
                  </div>

                  <div className="form-row-admin">
                    <div className="form-group-co">
                      <label>Care Difficulty</label>
                      <select name="difficulty" value={productForm.difficulty} onChange={handleInputChange}>
                        <option value="Beginner">Beginner (Hard to kill)</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="form-group-co">
                      <label>Mature Size (Height)</label>
                      <input 
                        type="text" 
                        name="size" 
                        value={productForm.size} 
                        onChange={handleInputChange} 
                        placeholder="E.g. 15-20 inches"
                      />
                    </div>
                  </div>

                  <div className="form-group-co full-width">
                    <label>Specific Health Benefit</label>
                    <input 
                      type="text" 
                      name="benefit" 
                      value={productForm.benefit} 
                      onChange={handleInputChange} 
                      placeholder="E.g. Relieves tension, purifies formaldehyde"
                    />
                  </div>

                  <div className="form-actions-admin">
                    <button type="submit" className="admin-submit-btn">
                      {editingProduct ? 'Save Changes' : 'Add Product'}
                    </button>
                    {editingProduct && (
                      <button 
                        type="button" 
                        className="admin-cancel-btn" 
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            name: '', cost: '', image: '', category: 'Air Purifying',
                            description: '', sunlight: '', water: '', difficulty: 'Easy', size: '', benefit: ''
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Inventory Table Panel */}
              <div className="inventory-table-card">
                <h3>Current Stock ({catalog.length} Plants)</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalog.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <img src={product.image} alt={product.name} className="admin-table-thumb" />
                          </td>
                          <td><strong>{product.name}</strong></td>
                          <td><span className="admin-cat-label">{product.category}</span></td>
                          <td><span className="admin-price-label">{product.cost}</span></td>
                          <td>
                            <div className="admin-actions-cell">
                              <button 
                                className="admin-action-btn edit" 
                                onClick={() => handleEditClick(product)}
                                title="Edit product parameters"
                              >
                                Edit
                              </button>
                              <button 
                                className="admin-action-btn delete" 
                                onClick={() => handleDeleteClick(product.id)}
                                title="Delete product from stock"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="orders-view animate-fade-in">
            <h3>Incoming Customer Purchases ({orders.length} Orders)</h3>
            {orders.length === 0 ? (
              <div className="profile-empty-state">
                <div className="empty-state-icon">🛒</div>
                <h3>No Orders Placed Yet</h3>
                <p>When customers buy plants, they will appear in this control panel.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table text-left">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Items Purchased</th>
                      <th>Total Paid</th>
                      <th>Status & Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={idx}>
                        <td><span className="order-id-label">{order.id}</span></td>
                        <td>{new Date(order.date).toLocaleDateString()}<br />{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td>
                          <strong>{order.customerName}</strong><br />
                          <span className="admin-order-email">{order.customerEmail}</span><br />
                          <span className="admin-order-phone">{order.customerPhone}</span>
                        </td>
                        <td>
                          <div className="admin-order-items-summary">
                            {order.items.map((item, key) => (
                              <div key={key} className="order-summary-row-desc">
                                • {item.name} <span className="item-qty-admin">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td><strong>${order.totalAmount}</strong></td>
                        <td>
                          <div className="admin-status-dropdown-group">
                            <span className={`status-pill ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                            <select 
                              value={order.status} 
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="status-selector-admin"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
