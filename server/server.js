import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/config/socket.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Create HTTP server & Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    // 3. Start listening
    httpServer.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  ✨ WedConnect Server Running on Port ${PORT} ✨`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Base API: http://localhost:${PORT}/api/v1`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      httpServer.close(() => {
        console.log('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server Error] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
