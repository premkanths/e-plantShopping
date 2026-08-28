import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
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
  }
};

const loadInitialUser = () => {
  try {
    const savedUser = localStorage.getItem('ep_user_profile');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return DEFAULT_USER;
  }
};

const loadInitialWishlist = () => {
  try {
    const savedWishlist = localStorage.getItem('ep_user_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return [];
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: loadInitialUser(),
    wishlist: loadInitialWishlist(),
    role: 'customer' // 'customer' or 'admin'
  },
  reducers: {
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      localStorage.setItem('ep_user_profile', JSON.stringify(state.profile));
    },
    toggleWishlist: (state, action) => {
      const plantName = action.payload;
      if (state.wishlist.includes(plantName)) {
        state.wishlist = state.wishlist.filter(name => name !== plantName);
      } else {
        state.wishlist.push(plantName);
      }
      localStorage.setItem('ep_user_wishlist', JSON.stringify(state.wishlist));
    },
    setRole: (state, action) => {
      state.role = action.payload; // toggle user roles (customer or admin)
    }
  }
});

export const { updateProfile, toggleWishlist, setRole } = userSlice.actions;
export default userSlice.reducer;
