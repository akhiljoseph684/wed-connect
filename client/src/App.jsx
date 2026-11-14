import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearAuth } from "./store/slices/authSlice.js";
import authService from "./services/auth.service.js";
import AppRouter from "./routes/AppRouter.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkCurrentUser = async () => {
      try {
        const res = await authService.getMe();
        if (isMounted) {
          const user = res.data?.user || res.data || res;
          dispatch(setUser(user));
        }
      } catch (err) {
        if(err.status === 403 && err?.message.startsWith("Email verification")){
          navigate("/verify-email");
          return;
        }
        toast.error(err.message);
        if (isMounted) {
          dispatch(clearAuth());
        }
      }
    };

    checkCurrentUser();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return <AppRouter />
}
