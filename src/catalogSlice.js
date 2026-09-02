import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DEFAULT_PLANTS } from './plantsData';

// Helper to load initial catalog with fallback
const getInitialCatalog = () => {
  try {
    const saved = localStorage.getItem('ep_catalog');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_PLANTS.length) {
        const hasStalePhoto = parsed.some(p => p.image && p.image.includes('photo-1599599810769-bcde5a160d32'));
        if (!hasStalePhoto) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading saved catalog:', e);
  }
  return DEFAULT_PLANTS;
};

// Async thunks
export const fetchPlants = createAsyncThunk('catalog/fetchPlants', async () => {
  try {
    const response = await fetch('/api/plants');
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('ep_catalog', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/plants offline, using built-in catalog:', err.message);
  }
  return getInitialCatalog();
});

export const addProduct = createAsyncThunk('catalog/addProduct', async (plantData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const newProduct = {
    ...plantData,
    id: plantData.id || plantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: plantData.rating || 5.0
  };

  try {
    const response = await fetch('/api/plants', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newProduct)
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend offline, saving plant locally');
  }

  // Fallback to local storage
  const currentItems = getState().catalog.items;
  const updated = [...currentItems, newProduct];
  localStorage.setItem('ep_catalog', JSON.stringify(updated));
  return newProduct;
});

export const updateProduct = createAsyncThunk('catalog/updateProduct', async (plantData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch(`/api/plants/${plantData.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(plantData)
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend offline, updating plant locally');
  }

  // Fallback to local storage
  const currentItems = getState().catalog.items;
  const updated = currentItems.map(p => p.id === plantData.id ? { ...p, ...plantData } : p);
  localStorage.setItem('ep_catalog', JSON.stringify(updated));
  return plantData;
});

export const deleteProduct = createAsyncThunk('catalog/deleteProduct', async (plantId, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch(`/api/plants/${plantId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data.id || plantId;
    }
  } catch (err) {
    console.warn('Backend offline, deleting plant locally');
  }

  // Fallback to local storage
  const currentItems = getState().catalog.items;
  const updated = currentItems.filter(p => p.id !== plantId);
  localStorage.setItem('ep_catalog', JSON.stringify(updated));
  return plantId;
});

export const resetCatalog = createAsyncThunk('catalog/resetCatalog', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/plants/reset', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_catalog', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backend offline, resetting catalog locally');
  }

  localStorage.setItem('ep_catalog', JSON.stringify(DEFAULT_PLANTS));
  return DEFAULT_PLANTS;
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    items: getInitialCatalog(),
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch plants
      .addCase(fetchPlants.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        if (state.items.length === 0) {
          state.items = DEFAULT_PLANTS;
        }
      })
      // Add plant
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update plant
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete plant
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Reset catalog
      .addCase(resetCatalog.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export default catalogSlice.reducer;
