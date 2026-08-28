import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return await response.json();
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (orderData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Failed to place order');
  return await response.json();
});

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return await response.json();
});

export const deleteOrder = createAsyncThunk('orders/deleteOrder', async (orderId, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete order');
  const data = await response.json();
  return data.id; // Return the deleted order id
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Place order
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add new orders to the beginning
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export default orderSlice.reducer;
