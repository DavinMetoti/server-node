require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// get channel and screte key from .env
const VALID_CHANNELS = [
  process.env.CHANNEL_SET_MEDIKO,
  process.env.CHANNEL_ONCE_UKMPPD
];
const SECURE_KEYS = {
  [process.env.CHANNEL_SET_MEDIKO]: process.env.SECURE_KEY_SET_MEDIKO,
  [process.env.CHANNEL_ONCE_UKMPPD]: process.env.SECURE_KEY_ONCE_UKMPPD
};

// Middleware auth Socket.IO
io.use((socket, next) => {
  const { channel, secureKey } = socket.handshake.query;

  if (!channel || !secureKey) {
    return next(new Error('Unauthorized: Missing channel or secureKey'));
  }

  if (!VALID_CHANNELS.includes(channel) || SECURE_KEYS[channel] !== secureKey) {
    return next(new Error('Unauthorized: Invalid channel or secureKey'));
  }

  socket.channel = channel;
  next();
});

// Event Socket.IO
io.on('connection', (socket) => {
  console.log(`✅ User connected on "${socket.channel}" with ID: ${socket.id}`);

  // private room
  socket.join(socket.channel);

  socket.on('send-message', (data) => {
    console.log(`[${socket.channel}] Received message:`, data);

    // Just send the message to the private room
    io.to(socket.channel).emit('receive-message', data);
  });

  socket.on('check-trigger', (data, callback) => {
    console.log(`[${socket.channel}] Trigger check from ${socket.id}:`, data);
    const isTriggered = true;
    if (typeof callback === 'function') {
      callback(isTriggered);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id} from "${socket.channel}"`);
  });
});

app.get('/', (req, res) => {
  res.send('this osce mediko secure socket server is running 🚀');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 Secure Socket.IO server running at http://0.0.0.0:${PORT}`);
});
