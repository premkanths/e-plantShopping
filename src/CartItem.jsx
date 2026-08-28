import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from './CartSlice';
import './CartItem.css';

function CartItem({ onContinueShopping, onCheckoutClick }) {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  // Helper to convert cost string like "$15" to number
  const parseCost = (costStr) => {
    return parseFloat(costStr.replace('$', ''));
  };

  // Calculate total amount for all items in the cart
  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = parseCost(item.cost);
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  // Calculate total items count in the cart
  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate subtotal for a single item (price * quantity)
  const calculateSubtotal = (item) => {
    const price = parseCost(item.cost);
    return (price * item.quantity).toFixed(2);
  };

  const handleIncrement = (item) => {
    dispatch(updateQuantity({ name: item.name, quantity: item.quantity + 1 }));
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ name: item.name, quantity: item.quantity - 1 }));
    } else {
      // If quantity is 1 and they press decrement, remove the item
      dispatch(removeItem(item.name));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeItem(item.name));
  };

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (onCheckoutClick) {
      onCheckoutClick();
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Shopping Cart</h2>
      <h4 className="cart-total-items">Total Plants in Cart: {calculateTotalItems()}</h4>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <p className="empty-cart-text">Your cart is currently empty. Bring home some green friends!</p>
          <button className="continue-shopping-btn" onClick={onContinueShopping}>
            Explore Plants
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item-card">
                <div className="cart-item-img-container">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-cost">Price: {item.cost}</p>
                  
                  <div className="cart-item-quantity-controls">
                    <button 
                      className="quantity-btn dec-btn" 
                      onClick={() => handleDecrement(item)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn inc-btn" 
                      onClick={() => handleIncrement(item)}
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="cart-item-subtotal">Subtotal: ${calculateSubtotal(item)}</p>
                  <button className="delete-btn" onClick={() => handleRemove(item)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-card">
            <h3 className="summary-title">Summary</h3>
            <div className="summary-row">
              <span>Total Items:</span>
              <span>{calculateTotalItems()}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Cost:</span>
              <span className="total-amount">${calculateTotalAmount()}</span>
            </div>
            <div className="cart-actions">
              <button className="continue-shopping-btn outline" onClick={onContinueShopping}>
                Continue Shopping
              </button>
              <button className="checkout-btn" onClick={handleCheckoutClick}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartItem;
