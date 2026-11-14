import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import weddingPlanReducer from './slices/weddingPlanSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import platformReducer from './slices/platformSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    weddingPlan: weddingPlanReducer,
    notifications: notificationReducer,
    platform: platformReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
