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
    try {
        const musicData = req.body;
        
        // Validate input
        if (!musicData || (!musicData.query && typeof musicData !== 'string')) {
            return res.status(400).json({ 
                error: 'Invalid request data', 
                code: 'INVALID_INPUT'
            });
        }
        
        // Add event with timestamp and ID
        const event = {
            id: Date.now() + Math.random(), // Unique ID
            query: musicData.query || musicData,
            timestamp: new Date().toISOString(),
            clientId: musicData.clientId || 'unknown',
            ip: req.ip || req.connection.remoteAddress
        };
        
        musicEvents.push(event);
        
        // Keep only last 10 events to prevent memory issues
        if (musicEvents.length > 10) {
            musicEvents = musicEvents.slice(-10);
        }
        
        // Log for monitoring
        console.log(`[${new Date().toISOString()}] Music event: ${event.query} from ${event.clientId}`);
        
        res.json({ success: true, eventId: event.id });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in play-music endpoint:`, error);
        res.status(500).json({ 
            error: 'Internal server error', 
            code: 'SERVER_ERROR'
        });
    }
});

// API endpoint for polling music events
app.get('/api/music-events', (req, res) => {
    try {
        const clientId = req.query.clientId || 'viewer-' + Date.now();
        
        // Add client to connected set
        connectedClients.add(clientId);
        
        // Return latest events
        res.json({
            events: musicEvents,
            clientId: clientId,
            connectedClients: connectedClients.size,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in music-events endpoint:`, error);
        res.status(500).json({ 
            error: 'Internal server error', 
            code: 'SERVER_ERROR'
        });
    }
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
