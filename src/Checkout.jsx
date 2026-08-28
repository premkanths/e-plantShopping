import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder } from './orderSlice';
import './Checkout.css';

// Custom clean cart action dispatcher helper since CartSlice can be updated
// Or we can just import from CartSlice if we add clearCart there later
import { updateQuantity, removeItem } from './CartSlice';

function Checkout({ onOrderCompleted, onCancel }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const userProfile = useSelector(state => state.user.profile);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Receipt/Invoice
  const [shippingData, setShippingData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: '',
    street: userProfile.shippingAddress?.street || '',
    city: userProfile.shippingAddress?.city || '',
    state: userProfile.shippingAddress?.state || '',
    zip: userProfile.shippingAddress?.zip || '',
  });

  const [paymentData, setPaymentData] = useState({
    cardName: userProfile.name || '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [errors, setErrors] = useState({});
  const [createdOrder, setCreatedOrder] = useState(null);

  // Math helper
  const parseCost = (costStr) => parseFloat(costStr.replace('$', ''));
  const subtotal = cartItems.reduce((sum, item) => sum + parseCost(item.cost) * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% sales tax
  const shippingFee = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shippingFee;

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePaymentChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'cardNumber') {
      // Formats card number: 1234 5678 1234 5678
      val = val.replace(/\D/g, '').substring(0, 16);
      val = val.match(/.{1,4}/g)?.join(' ') || val;
    } else if (e.target.name === 'cardExpiry') {
      // Formats expiry MM/YY
      val = val.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
    } else if (e.target.name === 'cardCvv') {
      val = val.replace(/\D/g, '').substring(0, 3);
    }
    setPaymentData({ ...paymentData, [e.target.name]: val });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateShipping = () => {
    const errs = {};
    if (!shippingData.name.trim()) errs.name = 'Full name is required';
    if (!shippingData.email.trim() || !/\S+@\S+\.\S+/.test(shippingData.email)) errs.email = 'Valid email is required';
    if (!shippingData.phone.trim()) errs.phone = 'Phone number is required';
    if (!shippingData.street.trim()) errs.street = 'Street address is required';
    if (!shippingData.city.trim()) errs.city = 'City is required';
    if (!shippingData.state.trim()) errs.state = 'State is required';
    if (!shippingData.zip.trim() || shippingData.zip.length < 5) errs.zip = 'Valid zip code is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    if (!paymentData.cardName.trim()) errs.cardName = 'Name on card is required';
    if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) errs.cardNumber = 'Enter a valid 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) errs.cardExpiry = 'Expiry must be in MM/YY format';
    if (paymentData.cardCvv.length !== 3) errs.cardCvv = 'CVV must be 3 digits';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = () => {
    const orderDetails = {
      customerName: shippingData.name,
      customerEmail: shippingData.email,
      customerPhone: shippingData.phone,
      shippingAddress: {
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        zip: shippingData.zip,
      },
      items: cartItems.map(item => ({
        name: item.name,
        cost: item.cost,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      totalAmount: total.toFixed(2),
    };

    // Store in Redux (placeOrder automatically injects order ID and timestamp)
    dispatch(placeOrder(orderDetails));

    // Create custom confirmation view locally
    const receiptOrder = {
      ...orderDetails,
      id: `EP-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setCreatedOrder(receiptOrder);
    setStep(4);

    // Clear cart item by item since standard redux slice doesn't have clearCart
    cartItems.forEach(item => {
      dispatch(removeItem(item.name));
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="checkout-outer-container">
        <div className="checkout-empty-state">
          <h3>Your cart is empty</h3>
          <p>Please add plants to the cart before checking out.</p>
          <button className="checkout-back-btn" onClick={onCancel}>Go back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-outer-container">
      {/* Progress Bar (Hide on final receipt) */}
      {step < 4 && (
        <div className="checkout-steps-bar">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Shipping</label>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Payment</label>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Confirm</label>
          </div>
        </div>
      )}

      {/* STEP 1: SHIPPING FORM */}
      {step === 1 && (
        <div className="checkout-step-container animate-fade-in">
          <div className="checkout-form-sec">
            <h2 className="section-title-co">Shipping Address</h2>
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="co-form">
              <div className="form-group-co full-width">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={shippingData.name} 
                  onChange={handleShippingChange} 
                  placeholder="John Doe"
                />
                {errors.name && <span className="error-txt">{errors.name}</span>}
              </div>

              <div className="form-group-co">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={shippingData.email} 
                  onChange={handleShippingChange} 
                  placeholder="john.doe@example.com"
                />
                {errors.email && <span className="error-txt">{errors.email}</span>}
              </div>

              <div className="form-group-co">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={shippingData.phone} 
                  onChange={handleShippingChange} 
                  placeholder="(123) 456-7890"
                />
                {errors.phone && <span className="error-txt">{errors.phone}</span>}
              </div>

              <div className="form-group-co full-width">
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="street" 
                  value={shippingData.street} 
                  onChange={handleShippingChange} 
                  placeholder="123 Plant Road"
                />
                {errors.street && <span className="error-txt">{errors.street}</span>}
              </div>

              <div className="form-group-co">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={shippingData.city} 
                  onChange={handleShippingChange} 
                  placeholder="Denver"
                />
                {errors.city && <span className="error-txt">{errors.city}</span>}
              </div>

              <div className="form-group-co small">
                <label>State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={shippingData.state} 
                  onChange={handleShippingChange} 
                  placeholder="CO"
                />
                {errors.state && <span className="error-txt">{errors.state}</span>}
              </div>

              <div className="form-group-co small">
                <label>Zip Code</label>
                <input 
                  type="text" 
                  name="zip" 
                  value={shippingData.zip} 
                  onChange={handleShippingChange} 
                  placeholder="80211"
                />
                {errors.zip && <span className="error-txt">{errors.zip}</span>}
              </div>
            </form>
          </div>

          {/* Right Summary Column */}
          <div className="checkout-summary-sec">
            <h3 className="summary-title-co">Order Summary</h3>
            <div className="summary-items-list-co">
              {cartItems.map((item, index) => (
                <div key={index} className="summary-item-co">
                  <span>{item.name} <span className="item-qty-co">x{item.quantity}</span></span>
                  <span>${(parseCost(item.cost) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <div className="totals-row-co">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row-co">
                <span>Taxes (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="totals-row-co">
                <span>Shipping:</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="totals-row-co grand-total-co">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="co-action-btns">
              <button className="co-btn-primary" onClick={nextStep}>Continue to Payment</button>
              <button className="co-btn-outline" onClick={onCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT FORM */}
      {step === 2 && (
        <div className="checkout-step-container animate-fade-in">
          <div className="checkout-form-sec">
            <h2 className="section-title-co">Payment Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="co-form">
              <div className="form-group-co full-width">
                <label>Name on Card</label>
                <input 
                  type="text" 
                  name="cardName" 
                  value={paymentData.cardName} 
                  onChange={handlePaymentChange} 
                  placeholder="Jane Doe"
                />
                {errors.cardName && <span className="error-txt">{errors.cardName}</span>}
              </div>

              <div className="form-group-co full-width">
                <label>Card Number</label>
                <div className="card-input-wrapper">
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={paymentData.cardNumber} 
                    onChange={handlePaymentChange} 
                    placeholder="1234 5678 1234 5678"
                  />
                  <div className="card-brand-icon">💳</div>
                </div>
                {errors.cardNumber && <span className="error-txt">{errors.cardNumber}</span>}
              </div>

              <div className="form-group-co">
                <label>Expiration Date</label>
                <input 
                  type="text" 
                  name="cardExpiry" 
                  value={paymentData.cardExpiry} 
                  onChange={handlePaymentChange} 
                  placeholder="MM/YY"
                />
                {errors.cardExpiry && <span className="error-txt">{errors.cardExpiry}</span>}
              </div>

              <div className="form-group-co">
                <label>Security Code (CVV)</label>
                <input 
                  type="password" 
                  name="cardCvv" 
                  value={paymentData.cardCvv} 
                  onChange={handlePaymentChange} 
                  placeholder="123"
                />
                {errors.cardCvv && <span className="error-txt">{errors.cardCvv}</span>}
              </div>
            </form>
          </div>

          {/* Right Summary Column */}
          <div className="checkout-summary-sec">
            <h3 className="summary-title-co">Review Order</h3>
            <div className="checkout-info-tile">
              <strong>Shipping to:</strong>
              <div>{shippingData.name}</div>
              <div>{shippingData.street}, {shippingData.city}, {shippingData.state} {shippingData.zip}</div>
              <div>{shippingData.phone}</div>
            </div>
            <div className="checkout-totals">
              <div className="totals-row-co">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row-co grand-total-co">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="co-action-btns">
              <button className="co-btn-primary" onClick={nextStep}>Review & Confirm</button>
              <button className="co-btn-outline" onClick={prevStep}>Back to Shipping</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER REVIEW */}
      {step === 3 && (
        <div className="checkout-step-container animate-fade-in">
          <div className="checkout-form-sec order-review-sec">
            <h2 className="section-title-co">Confirm Your Order</h2>
            
            <div className="review-block">
              <h3>Shipping Information</h3>
              <p>
                <strong>{shippingData.name}</strong><br />
                {shippingData.street}<br />
                {shippingData.city}, {shippingData.state} {shippingData.zip}<br />
                Phone: {shippingData.phone} | Email: {shippingData.email}
              </p>
            </div>

            <div className="review-block">
              <h3>Payment Method</h3>
              <p>
                Card ending in <strong>{paymentData.cardNumber.slice(-4)}</strong><br />
                Holder: {paymentData.cardName}
              </p>
            </div>

            <div className="review-block">
              <h3>Shopping Cart Items</h3>
              <div className="review-items-table">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="review-item-row">
                    <img src={item.image} alt={item.name} className="review-item-img" />
                    <div className="review-item-name">
                      <strong>{item.name}</strong>
                      <span className="price-item">{item.cost} each</span>
                    </div>
                    <div className="review-item-qty">Qty: {item.quantity}</div>
                    <div className="review-item-subtotal">${(parseCost(item.cost) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="checkout-summary-sec">
            <h3 className="summary-title-co">Final Bill Breakdown</h3>
            <div className="checkout-totals">
              <div className="totals-row-co">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row-co">
                <span>Taxes (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="totals-row-co">
                <span>Shipping Cost:</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="totals-row-co grand-total-co">
                <span>Total Amount:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="co-action-btns">
              <button className="co-btn-primary place-order-btn" onClick={handlePlaceOrder}>
                💳 Place Order - ${total.toFixed(2)}
              </button>
              <button className="co-btn-outline" onClick={prevStep}>Back to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PRINTABLE INVOICE / RECEIPT */}
      {step === 4 && createdOrder && (
        <div className="receipt-view-wrapper animate-fade-in">
          <div className="receipt-actions-top no-print">
            <button className="print-receipt-btn" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Receipt / Save PDF
            </button>
            <button className="done-receipt-btn" onClick={onOrderCompleted}>
              Continue Shopping
            </button>
          </div>

          {/* Printable Sheet */}
          <div className="receipt-paper" id="printable-invoice">
            <div className="receipt-header">
              <div className="receipt-brand">
                <span className="logo-icon-receipt">🌿</span>
                <div>
                  <h2>Paradise Nursery</h2>
                  <span>Green is Serenity</span>
                </div>
              </div>
              <div className="receipt-meta">
                <h1>INVOICE</h1>
                <div><strong>Order ID:</strong> {createdOrder.id}</div>
                <div><strong>Date:</strong> {createdOrder.date}</div>
              </div>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-addresses">
              <div className="address-col">
                <h3>Customer Shipping</h3>
                <p>
                  <strong>{createdOrder.customerName}</strong><br />
                  {createdOrder.shippingAddress.street}<br />
                  {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} {createdOrder.shippingAddress.zip}<br />
                  Phone: {createdOrder.customerPhone}<br />
                  Email: {createdOrder.customerEmail}
                </p>
              </div>
              <div className="address-col">
                <h3>Sold By</h3>
                <p>
                  <strong>Paradise Nursery Shop</strong><br />
                  Bangalore<br />
                  Phone: 8088113122<br />
                  premkanthks@gmail.com
                </p>
              </div>
            </div>

            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="align-center">Qty</th>
                  <th className="align-right">Unit Price</th>
                  <th className="align-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {createdOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="receipt-item-desc">
                        <strong>{item.name}</strong>
                      </div>
                    </td>
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
                  <span>${createdOrder.subtotal}</span>
                </div>
                <div className="totals-tr">
                  <span>Taxes (8%):</span>
                  <span>${createdOrder.tax}</span>
                </div>
                <div className="totals-tr">
                  <span>Shipping:</span>
                  <span>{parseFloat(createdOrder.shippingFee) === 0 ? 'FREE' : `$${createdOrder.shippingFee}`}</span>
                </div>
                <hr />
                <div className="totals-tr grand-total-tr">
                  <span>Grand Total Paid:</span>
                  <span>${createdOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="receipt-footer-text">
              <h3>Thank you for shopping with us!</h3>
              <p>Your plants will be packed with organic fertilizer and shipped within 2-3 business days. Care instructions will be emailed to your inbox. Let's make the world greener together!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
