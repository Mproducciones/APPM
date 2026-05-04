const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'master.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
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

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Controlador: http://localhost:${PORT}`);
    console.log(`Espectador: http://localhost:${PORT}/viewer`);
});
