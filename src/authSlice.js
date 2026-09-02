import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Default guest profiles for offline / showcase use
const GUEST_CUSTOMER = {
  id: 1,
  name: 'Guest Customer',
  email: 'customer@nursery.com',
  role: 'customer',
  shippingAddress: {
    street: '123 Forest Avenue',
    city: 'Greenwood',
    state: 'CO',
    zip: '80111'
  },
  savedCard: {
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '•••'
  },
  wishlist: [],
  auth_provider: 'local'
};

const GUEST_ADMIN = {
  id: 2,
  name: 'Guest Admin',
  email: 'admin@nursery.com',
  role: 'admin',
  shippingAddress: {
    street: '555 Greenery Way',
    city: 'Bangalore',
    state: 'KA',
    zip: '560001'
  },
  savedCard: {
    number: '•••• •••• •••• 8888',
    expiry: '10/29',
    cvv: '•••'
  },
  wishlist: [],
  auth_provider: 'local'
};

// Initial user from localStorage
const getSavedUser = () => {
  try {
    const userJson = localStorage.getItem('ep_auth_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

// Async thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  const { email, password } = credentials;

  // 1. Try backend API first
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_auth_token', data.token);
      localStorage.setItem('ep_auth_user', JSON.stringify(data.user));
      return data; // { token, user }
    }
  } catch (err) {
    console.warn('Backend login endpoint unavailable, attempting fallback authentication:', err.message);
  }

  // 2. Offline / Showcase Fallback for Guest logins
  if (email === 'customer@nursery.com' && (password === 'customer123' || !password)) {
    const guestToken = 'guest-token-' + Date.now();
    localStorage.setItem('ep_auth_token', guestToken);
    localStorage.setItem('ep_auth_user', JSON.stringify(GUEST_CUSTOMER));
    return { token: guestToken, user: GUEST_CUSTOMER };
  }

  if (email === 'admin@nursery.com' && (password === 'admin123' || !password)) {
    const guestToken = 'admin-token-' + Date.now();
    localStorage.setItem('ep_auth_token', guestToken);
    localStorage.setItem('ep_auth_user', JSON.stringify(GUEST_ADMIN));
    return { token: guestToken, user: GUEST_ADMIN };
  }

  // 3. Offline fallback for local stored users
  try {
    const localUsers = JSON.parse(localStorage.getItem('ep_registered_users') || '[]');
    const matched = localUsers.find(u => u.email === email && u.password === password);
    if (matched) {
      const userObj = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role || 'customer',
        shippingAddress: {},
        savedCard: {},
        wishlist: [],
        auth_provider: 'local'
      };
      const token = 'local-token-' + Date.now();
      localStorage.setItem('ep_auth_token', token);
      localStorage.setItem('ep_auth_user', JSON.stringify(userObj));
      return { token, user: userObj };
    }
  } catch (e) {
    console.warn('Local user lookup error:', e);
  }

  return rejectWithValue('Invalid email or password. Please try again or use Guest Access.');
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  const { name, email, password } = userData;

  // 1. Try backend API
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_auth_token', data.token);
      localStorage.setItem('ep_auth_user', JSON.stringify(data.user));
      return data;
    }
  } catch (err) {
    console.warn('Backend register unavailable, saving locally:', err.message);
  }

  // 2. Offline fallback registration
  try {
    const localUsers = JSON.parse(localStorage.getItem('ep_registered_users') || '[]');
    if (localUsers.some(u => u.email === email)) {
      return rejectWithValue('A user with this email already exists.');
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: 'customer'
    };
    localUsers.push(newUser);
    localStorage.setItem('ep_registered_users', JSON.stringify(localUsers));

    const userProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'customer',
      shippingAddress: {},
      savedCard: {},
      wishlist: [],
      auth_provider: 'local'
    };
    const token = 'local-token-' + Date.now();
    localStorage.setItem('ep_auth_token', token);
    localStorage.setItem('ep_auth_user', JSON.stringify(userProfile));
    return { token, user: userProfile };
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed.');
  }
});

export const loginWithGoogleAsync = createAsyncThunk('auth/loginWithGoogleAsync', async (credential, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_auth_token', data.token);
      localStorage.setItem('ep_auth_user', JSON.stringify(data.user));
      return data;
    }
  } catch (err) {
    console.warn('Backend Google Auth offline, attempting simulated token decode');
  }

  // Fallback: decode JWT payload from Google credential client-side
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);
    
    const googleUser = {
      id: payload.sub || Date.now(),
      name: payload.name || 'Google User',
      email: payload.email || 'user@gmail.com',
      role: 'customer',
      shippingAddress: {},
      savedCard: {},
      wishlist: [],
      auth_provider: 'google'
    };
    const token = 'google-token-' + Date.now();
    localStorage.setItem('ep_auth_token', token);
    localStorage.setItem('ep_auth_user', JSON.stringify(googleUser));
    return { token, user: googleUser };
  } catch (e) {
    return rejectWithValue('Failed to process Google sign-in.');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('ep_auth_token');
  const savedUser = getSavedUser();
  if (!token) return rejectWithValue('No token found');

  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_auth_user', JSON.stringify(data));
      return { token, user: data };
    }
  } catch (err) {
    console.warn('Backend /api/auth/me offline, using cached session');
  }

  if (savedUser) {
    return { token, user: savedUser };
  }

  localStorage.removeItem('ep_auth_token');
  localStorage.removeItem('ep_auth_user');
  return rejectWithValue('Session expired');
});

const savedUser = getSavedUser();
const savedToken = localStorage.getItem('ep_auth_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || null,
    user: savedUser || null,
    isAuthenticated: !!(savedToken && savedUser),
    status: 'idle',
    error: null
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('ep_auth_token');
      localStorage.removeItem('ep_auth_user');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Google Login
      .addCase(loginWithGoogleAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogleAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogleAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        // Only clear state if there was truly no saved session
        if (!state.user) {
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  }
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
