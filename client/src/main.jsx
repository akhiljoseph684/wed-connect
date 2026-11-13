import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store.js';
import { SocketProvider } from './context/SocketContext.jsx';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FDFAF6',
                color: '#2C2C2C',
                border: '1px solid #C9A84C',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#7D1E3B', secondary: '#FDFAF6' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#FDFAF6' },
              },
            }}
          />
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
