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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send-message', (data) => {
    console.log('Received message:', data);
    io.emit('receive-message', data);
  });

  socket.on('check-trigger', (data, callback) => {
    console.log('Received check-trigger from:', socket.id, 'with data:', data);
    const isTriggered = true;
    if (typeof callback === 'function') {
      callback(isTriggered);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('this osce mediko server is running 🚀');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on http://0.0.0.0:${PORT}`);
});
