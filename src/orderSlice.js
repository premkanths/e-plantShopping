import { createSlice } from '@reduxjs/toolkit';

const loadInitialOrders = () => {
  try {
    const savedOrders = localStorage.getItem('ep_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Failed to load orders from localStorage:', error);
    return [];
  }
};

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: loadInitialOrders(),
  },
  reducers: {
    placeOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: `EP-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        status: 'Pending',
      };
      state.items.unshift(newOrder); // Add new orders to the beginning
      localStorage.setItem('ep_orders', JSON.stringify(state.items));
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.items.find(item => item.id === orderId);
      if (order) {
        order.status = status;
        localStorage.setItem('ep_orders', JSON.stringify(state.items));
      }
    },
    deleteOrder: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('ep_orders', JSON.stringify(state.items));
    }
  }
});

export const { placeOrder, updateOrderStatus, deleteOrder } = orderSlice.actions;
export default orderSlice.reducer;
