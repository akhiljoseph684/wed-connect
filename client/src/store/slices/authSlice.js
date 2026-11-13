import { createSlice } from '@reduxjs/toolkit';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('wedconnect_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    accessToken: localStorage.getItem('wedconnect_access_token') || null,
    isAuthenticated: !!localStorage.getItem('wedconnect_access_token'),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      if (user) localStorage.setItem('wedconnect_user', JSON.stringify(user));
      if (accessToken) localStorage.setItem('wedconnect_access_token', accessToken);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('wedconnect_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('wedconnect_user');
      localStorage.removeItem('wedconnect_access_token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!state.accessToken;
      if (action.payload) localStorage.setItem('wedconnect_user', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) localStorage.setItem('wedconnect_access_token', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('wedconnect_user');
      localStorage.removeItem('wedconnect_access_token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setUser, setToken, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
