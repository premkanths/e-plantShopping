import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to login');
    }
    
    localStorage.setItem('ep_auth_token', data.token);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to register');
    }

    localStorage.setItem('ep_auth_token', data.token);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const loginWithGoogleAsync = createAsyncThunk('auth/loginWithGoogleAsync', async (credential, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to log in with Google');
    }

    localStorage.setItem('ep_auth_token', data.token);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('ep_auth_token');
    if (!token) return rejectWithValue('No token found');

    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
      localStorage.removeItem('ep_auth_token');
      return rejectWithValue(data.error || 'Session expired');
    }

    return { token, user: data };
  } catch (err) {
    return rejectWithValue(err.message || 'Network error');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('ep_auth_token') || null,
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('ep_auth_token');
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
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
