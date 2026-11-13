import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice.js';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected to WedConnect server:', socketInstance.id);
    });

    socketInstance.on('presence:changed', (data) => {
      if (data?.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
    });

    socketInstance.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
      toast((t) => (
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-burgundy" />
          <div>
            <p className="text-sm font-semibold text-charcoal">{notification.title}</p>
            <p className="text-xs text-mutedGray">{notification.message}</p>
          </div>
        </div>
      ), {
        style: {
          background: '#FAF8F4',
          border: '1px solid #C5A46D',
          padding: '12px 16px',
          color: '#252329',
          boxShadow: '0 10px 25px -5px rgba(114, 47, 69, 0.1)',
        },
      });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id, accessToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
