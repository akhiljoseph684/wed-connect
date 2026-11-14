import React, { createContext, useContext, useEffect, useState } from "react";

import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice.js";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {

    if (!user?._id) {
      console.warn("[Socket] Connection skipped: Missing authentication");
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    console.log("[Socket] Connecting to:", socketUrl);

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    console.log("[Socket] Socket instance created:", socketInstance);

    socketInstance.on("connect", () => {
      console.log("[Socket] CONNECTED:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] CONNECTION ERROR:", error.message);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("[Socket] DISCONNECTED:", reason);
      setIsConnected(false);
    });

    socketInstance.io.on("reconnect_attempt", (attempt) => {
      console.log("[Socket] RECONNECT ATTEMPT:", attempt);
    });

    socketInstance.on("presence:changed", (data) => {
      console.log("[Socket] Presence changed:", data);

      if (data?.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
    });

    socketInstance.on("notification:new", (notification) => {
      console.log("[Socket] New notification:", notification);

      dispatch(addNotification(notification));

      toast(notification.message);
    });

    setSocket(socketInstance);

    return () => {
      console.log("[Socket] Cleaning up connection");
      socketInstance.disconnect();
    };
  }, [user?._id, dispatch]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
