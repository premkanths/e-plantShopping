import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getSavedOrders = () => {
  try {
    const data = localStorage.getItem('ep_orders');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Async thunks
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      localStorage.setItem('ep_orders', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backend fetch orders offline, using local cache');
  }
  return getSavedOrders();
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (orderData, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  const fallbackOrder = {
    ...orderData,
    id: `EP-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString(),
    status: 'Processing',
    totalCost: orderData.totalAmount || orderData.totalCost || 0
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend place order offline, storing locally');
  }

  const existing = getSavedOrders();
  const updated = [fallbackOrder, ...existing];
  localStorage.setItem('ep_orders', JSON.stringify(updated));
  return fallbackOrder;
});

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async ({ orderId, status }, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend update order offline, updating locally');
  }

  const existing = getSavedOrders();
  const updated = existing.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem('ep_orders', JSON.stringify(updated));
  return { id: orderId, status };
});

export const deleteOrder = createAsyncThunk('orders/deleteOrder', async (orderId, { getState }) => {
  const token = getState().auth.token || localStorage.getItem('ep_auth_token');
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data.id || orderId;
    }
  } catch (err) {
    console.warn('Backend delete order offline, deleting locally');
  }

  const existing = getSavedOrders();
  const updated = existing.filter(o => o.id !== orderId);
  localStorage.setItem('ep_orders', JSON.stringify(updated));
  return orderId;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: getSavedOrders(),
    status: 'idle',
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
        state.items.unshift(action.payload);
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export default orderSlice.reducer;
