import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, registerUser, loginWithGoogleAsync, clearAuthError } from './authSlice';
import './Login.css';

function Login({ onLoginSuccess }) {
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');

  // Clear errors when toggling modes
  useEffect(() => {
    dispatch(clearAuthError());
    setLocalError('');
  }, [isRegister, dispatch]);

  // Handle successful login redirect
  useEffect(() => {
    if (isAuthenticated) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Email and Password are required.');
      return;
    }

    if (isRegister && !formData.name) {
      setLocalError('Name is required for registration.');
      return;
    }

    if (isRegister) {
      dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }));
    } else {
      dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }));
    }
  };

  const handleGuestLogin = (role) => {
    setLocalError('');
    if (role === 'customer') {
      dispatch(loginUser({ email: 'customer@nursery.com', password: 'customer123' }));
    } else if (role === 'admin') {
      dispatch(loginUser({ email: 'admin@nursery.com', password: 'admin123' }));
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setLocalError('');
    dispatch(loginWithGoogleAsync(credentialResponse.credential));
  };

  return (
    <div className="login-page-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <span className="login-logo-icon">🌿</span>
          <h2>Paradise Nursery</h2>
          <p>Where Green Meets Serenity</p>
        </div>

        <div className="login-tabs">
          <button 
            type="button" 
            className={`tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(false)}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => setIsRegister(true)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Full Name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {(localError || error) && (
            <div className="login-error-alert">
              ⚠️ {localError || error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or sign in with</span>
        </div>

        <div className="social-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setLocalError('Google login verification failed.')}
            theme="outline"
            shape="pill"
            text="signin_with"
            width="100%"
          />
        </div>

        <div className="guest-login-divider">
          <span>Showcase Guest Access</span>
        </div>

        <div className="guest-buttons">
          <button 
            type="button" 
            className="guest-btn guest-customer-btn"
            onClick={() => handleGuestLogin('customer')}
            disabled={status === 'loading'}
          >
            👤 Guest Buyer Login
          </button>
          <button 
            type="button" 
            className="guest-btn guest-admin-btn"
            onClick={() => handleGuestLogin('admin')}
            disabled={status === 'loading'}
          >
            🛠️ Guest Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
