import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchPlants = createAsyncThunk('catalog/fetchPlants', async () => {
  const response = await fetch('/api/plants');
  if (!response.ok) throw new Error('Failed to fetch plants');
  return await response.json();
});

export const addProduct = createAsyncThunk('catalog/addProduct', async (plantData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/plants', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(plantData)
  });
  if (!response.ok) throw new Error('Failed to add plant');
  return await response.json();
});

export const updateProduct = createAsyncThunk('catalog/updateProduct', async (plantData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch(`/api/plants/${plantData.id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(plantData)
  });
  if (!response.ok) throw new Error('Failed to update plant');
  return await response.json();
});

export const deleteProduct = createAsyncThunk('catalog/deleteProduct', async (plantId, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch(`/api/plants/${plantId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete plant');
  const data = await response.json();
  return data.id; // Return the deleted plant id
});

export const resetCatalog = createAsyncThunk('catalog/resetCatalog', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/plants/reset', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to reset catalog');
  return await response.json();
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
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
