import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import weddingPlanReducer from './slices/weddingPlanSlice.js';
import notificationReducer from './slices/notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    weddingPlan: weddingPlanReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
