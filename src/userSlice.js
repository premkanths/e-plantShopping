import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getSavedProfile = () => {
  try {
    const user = localStorage.getItem('ep_auth_user');
    if (user) {
      const parsed = JSON.parse(user);
      return {
        profile: {
          name: parsed.name || '',
          email: parsed.email || '',
          shippingAddress: parsed.shippingAddress || { street: '', city: '', state: '', zip: '' },
          savedCard: parsed.savedCard || { number: '', expiry: '', cvv: '' }
        },
        wishlist: parsed.wishlist || [],
        role: parsed.role || 'customer'
      };
    }
  } catch {}
  return {
    profile: {
      name: '',
      email: '',
      shippingAddress: { street: '', city: '', state: '', zip: '' },
      savedCard: { number: '', expiry: '', cvv: '' }
    },
    wishlist: [],
    role: 'customer'
  };
};

const initialData = getSavedProfile();

// Async thunks
export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend fetch profile offline, using cached profile');
  }

  return getSavedProfile().profile;
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (profileData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend update profile offline, updating locally');
  }

  // Update local user cache
  try {
    const user = JSON.parse(localStorage.getItem('ep_auth_user') || '{}');
    const updated = { ...user, ...profileData };
    localStorage.setItem('ep_auth_user', JSON.stringify(updated));
    return updated;
  } catch {}

  return profileData;
});

export const toggleWishlist = createAsyncThunk('user/toggleWishlist', async (plantName, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/user/wishlist', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plantName })
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend wishlist toggle offline, toggling locally');
  }

  const currentWishlist = getState().user.wishlist || [];
  const exists = currentWishlist.includes(plantName);
  const updatedWishlist = exists 
    ? currentWishlist.filter(name => name !== plantName) 
    : [...currentWishlist, plantName];
  
  try {
    const user = JSON.parse(localStorage.getItem('ep_auth_user') || '{}');
    user.wishlist = updatedWishlist;
    localStorage.setItem('ep_auth_user', JSON.stringify(user));
  } catch {}

  return updatedWishlist;
});

export const setRole = createAsyncThunk('user/setRole', async (role, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend setRole offline, setting locally');
  }

  try {
    const user = JSON.parse(localStorage.getItem('ep_auth_user') || '{}');
    user.role = role;
    localStorage.setItem('ep_auth_user', JSON.stringify(user));
  } catch {}

  return { role };
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: initialData.profile,
    wishlist: initialData.wishlist,
    role: initialData.role,
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
        state.role = action.payload.role || state.role;
      })
      // Toggle wishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      // Set role
      .addCase(setRole.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
        state.role = action.payload.role;
      });
  }
});

export default userSlice.reducer;
