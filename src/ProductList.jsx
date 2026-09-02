import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem } from './CartSlice';
import { toggleWishlist } from './userSlice';
import ProductQuickView from './ProductQuickView';
import './ProductList.css';

function ProductList({ onAddToCartClick }) {
  const dispatch = useDispatch();
  
  // Fetch products from catalog slice (updated by Admin CRUD)
  const catalogItems = useSelector(state => state.catalog.items);
  const cartItems = useSelector(state => state.cart.items);
  const wishlist = useSelector(state => state.user.wishlist);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedPlantForQuickView, setSelectedPlantForQuickView] = useState(null);

  // Extract categories dynamically
  const categories = ['All', ...new Set(catalogItems.map(item => item.category))];

  const handleAddToCart = (plant) => {
    dispatch(addItem(plant));
    if (onAddToCartClick) {
      onAddToCartClick(plant.name);
    }
  };

  const handleWishlistToggle = (plantName) => {
    dispatch(toggleWishlist(plantName));
  };

  // Convert cost "$15" -> 15.0
  const parseCost = (costStr) => parseFloat(costStr.replace('$', ''));

  // Filter and sort products
  let processedItems = [...catalogItems];

  // 1. Search Query Filter
  if (searchQuery.trim() !== '') {
    processedItems = processedItems.filter(plant => 
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      plant.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 2. Category Filter
  if (selectedCategory !== 'All') {
    processedItems = processedItems.filter(plant => plant.category === selectedCategory);
  }

  // 3. Sorting
  if (sortOrder === 'price-low') {
    processedItems.sort((a, b) => parseCost(a.cost) - parseCost(b.cost));
  } else if (sortOrder === 'price-high') {
    processedItems.sort((a, b) => parseCost(b.cost) - parseCost(a.cost));
  } else if (sortOrder === 'rating') {
    processedItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortOrder === 'alphabetical') {
    processedItems.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="catalog-container animate-fade-in">
      <div className="catalog-header">
        <h2>Our Beautiful Plant Collection</h2>
        <p>Select your favorite companions to bring fresh air, gorgeous fragrance, and positive vibes to your living space.</p>
      </div>

      {/* Filter and Search controls bar */}
      <div className="catalogue-filters-bar">
        <div className="filters-top-row">
          {/* Search */}
          <div className="search-wrapper-co">
            <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-input-co"
              placeholder="Search 64 plants by name or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sorting dropdown */}
          <div className="sort-wrapper-co">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="default">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="alphabetical">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="category-tabs-co">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`category-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {processedItems.length === 0 ? (
        <div className="catalog-empty-state">
          <h3>No Plants Found</h3>
          <p>We couldn't find any products matching your criteria. Try adjusting your search query or filters.</p>
          <button 
            className="clear-search-btn" 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSortOrder('default'); }}
          >
            Clear Filters & Search
          </button>
        </div>
      ) : (
        <div className="plants-grid">
          {processedItems.map((plant, index) => {
            const isInCart = cartItems.some(item => item.name === plant.name);
            const isWishlisted = wishlist.includes(plant.name);

            return (
              <div key={index} className="plant-card">
                {/* Floating Heart Button */}
                <button 
                  className={`wishlist-btn-catalog ${isWishlisted ? 'active' : ''}`}
                  onClick={() => handleWishlistToggle(plant.name)}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>

                <div className="plant-img-container">
                  <img src={plant.image} alt={plant.name} className="plant-image" />
                </div>

                <div className="plant-details">
                  <div className="plant-card-meta-row">
                    <h3 className="plant-name">{plant.name}</h3>
                    <span className="plant-price">{plant.cost}</span>
                  </div>

                  <div className="plant-rating-catalog">
                    <span className="star-icon-catalog">★</span>
                    <span>{plant.rating || '4.5'}</span>
                  </div>

                  <p className="plant-desc">{plant.description}</p>

                  <div className="plant-card-actions">
                    <button
                      className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
                      onClick={() => handleAddToCart(plant)}
                      disabled={isInCart}
                    >
                      {isInCart ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                    <button 
                      className="quick-view-btn"
                      onClick={() => setSelectedPlantForQuickView(plant)}
                    >
                      Care Info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK VIEW MODAL RENDERING */}
      {selectedPlantForQuickView && (
        <ProductQuickView 
          plant={selectedPlantForQuickView} 
          onClose={() => setSelectedPlantForQuickView(null)} 
        />
      )}
    </div>
  );
}

export default ProductList;
