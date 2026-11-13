import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken, clearAuth } from './store/slices/authSlice.js';
import AppRouter from './routes/AppRouter.jsx';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const token = localStorage.getItem('wedconnect_access_token');
      const userStr = localStorage.getItem('wedconnect_user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch(setToken(token));
        dispatch(setUser(user));
      }
    } catch (err) {
      localStorage.removeItem('wedconnect_access_token');
      localStorage.removeItem('wedconnect_user');
      dispatch(clearAuth());
    }
  }, [dispatch]);

  return <AppRouter />;
}
