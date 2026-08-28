import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './CartSlice';
import catalogReducer from './catalogSlice';
import ordersReducer from './orderSlice';
import userReducer from './userSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    catalog: catalogReducer,
    orders: ordersReducer,
    user: userReducer,
    auth: authReducer,
  },
});

export default store;
