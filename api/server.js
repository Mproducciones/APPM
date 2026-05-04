const express = require('express');
const path = require('path');

const app = express();

// Middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// In-memory storage for music events
let musicEvents = [];
let connectedClients = new Set();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'master.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'viewer.html'));
});

// API endpoint for sending music events
app.post('/api/play-music', (req, res) => {
    const musicData = req.body;
    console.log('Evento play-music recibido:', musicData);
    
    // Store the event
    musicEvents.push({
        ...musicData,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    
    // Keep only last 10 events
    if (musicEvents.length > 10) {
        musicEvents = musicEvents.slice(-10);
    }
    
    res.json({ success: true, message: 'Music event sent' });
});

// API endpoint for polling music events
app.get('/api/music-events', (req, res) => {
    const clientId = req.query.clientId || 'viewer-' + Date.now();
    
    // Add client to connected set
    connectedClients.add(clientId);
    
    // Return latest events
    res.json({
        events: musicEvents,
        clientId: clientId,
        timestamp: new Date().toISOString()
    });
});

// API endpoint for client heartbeat
app.post('/api/heartbeat', (req, res) => {
    const clientId = req.body.clientId;
    if (clientId) {
        connectedClients.add(clientId);
    }
    res.json({ success: true });
});

// API endpoint to get connection status
app.get('/api/status', (req, res) => {
    res.json({
        connectedClients: connectedClients.size,
        latestEvent: musicEvents[musicEvents.length - 1] || null
    });
});

// Export for Vercel
module.exports = (req, res) => {
    app(req, res);
};
