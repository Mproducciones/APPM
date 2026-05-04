const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'master.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'viewer.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Join to global room
    socket.join('global-room');
    console.log(`Usuario ${socket.id} se unió a la sala global`);
    
    // Handle play-music event
    socket.on('play-music', (data) => {
        console.log('Evento play-music recibido:', data);
        // Broadcast to all clients in the global room except sender
        socket.to('global-room').emit('play-music', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

// Export for Vercel
module.exports = (req, res) => {
    app(req, res);
};
