const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { verifyAccessToken } = require('../utils/jwt');

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    cookieParser()(socket.request, {}, (error) => {
      if (error) {
        return next(new Error('Unauthorized'));
      }

      try {
        const token = socket.request.cookies?.accessToken;
        if (!token) {
          throw new Error('Access token is required');
        }

        socket.user = verifyAccessToken(token);
        return next();
      } catch {
        return next(new Error('Unauthorized'));
      }
    });
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
  });

  return io;
};

module.exports = { createSocketServer };