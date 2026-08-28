import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return await response.json();
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (profileData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) throw new Error('Failed to update user profile');
  return await response.json();
});

export const toggleWishlist = createAsyncThunk('user/toggleWishlist', async (plantName, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/user/wishlist', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ plantName })
  });
  if (!response.ok) throw new Error('Failed to toggle wishlist');
  return await response.json(); // returns updated wishlist array
});

export const setRole = createAsyncThunk('user/setRole', async (role, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  if (!response.ok) throw new Error('Failed to set role');
  return await response.json(); // returns updated profile
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {
      name: '',
      email: '',
      shippingAddress: { street: '', city: '', state: '', zip: '' },
      savedCard: { number: '', expiry: '', cvv: '' }
    },
    wishlist: [],
    role: 'customer',
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.wishlist = action.payload.wishlist || [];
        state.role = action.payload.role || 'customer';
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.role = action.payload.role;
      })
      // Toggle wishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      // Set role
      .addCase(setRole.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.role = action.payload.role;
      });
  }
});

export default userSlice.reducer;
