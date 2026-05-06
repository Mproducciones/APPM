const express = require('express');
const path = require('path');
const fs = require('fs');

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

const settingsPath = path.join(__dirname, '..', 'settings.json');
let settings = {};

try {
    const settingsData = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(settingsData);
} catch (error) {
    console.error('Error loading settings:', error);
}

const MAX_EVENTS = settings.server?.maxEvents || 10;
const EVENT_TTL_MS = settings.server?.eventTtlMs || 60000;
const VIEWER_LOCK_TTL_MS = settings.server?.viewerLockTtlMs || 70000;

let musicEvents = [];
let connectedClients = new Set();
let activeViewer = { clientId: null, lastSeenMs: 0 };

function pruneExpiredEvents() {
    const nowMs = Date.now();
    musicEvents = musicEvents.filter((event) => {
        const eventMs = new Date(event.timestamp).getTime();
        return nowMs - eventMs <= EVENT_TTL_MS;
    });
}

function isViewerClient(clientId) {
    return typeof clientId === 'string' && clientId.startsWith('viewer-');
}

function isViewerLockExpired() {
    return !activeViewer.clientId || (Date.now() - activeViewer.lastSeenMs > VIEWER_LOCK_TTL_MS);
}

function claimOrTouchViewer(clientId) {
    if (!isViewerClient(clientId)) {
        return { allowed: true, active: activeViewer.clientId };
    }

    if (isViewerLockExpired()) {
        activeViewer = { clientId, lastSeenMs: Date.now() };
        return { allowed: true, active: clientId };
    }

    if (activeViewer.clientId === clientId) {
        activeViewer.lastSeenMs = Date.now();
        return { allowed: true, active: clientId };
    }

    return { allowed: false, active: activeViewer.clientId };
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'master.html'));
});

app.get('/viewer', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'viewer.html'));
});

app.get('/chat', (req, res) => {
    const chatPath = path.join(__dirname, '..', 'chat.html');
    if (fs.existsSync(chatPath)) {
        return res.sendFile(chatPath);
    }

    return res.status(404).json({
        error: 'chat.html not found',
        code: 'CHAT_PAGE_MISSING'
    });
});

app.post('/api/play-music', (req, res) => {
    try {
        pruneExpiredEvents();
        const musicData = req.body;

        if (!musicData || (!musicData.query && typeof musicData !== 'string')) {
            return res.status(400).json({
                error: 'Invalid request data',
                code: 'INVALID_INPUT'
            });
        }

        const event = {
            id: Date.now() + Math.random(),
            query: musicData.query || musicData,
            timestamp: new Date().toISOString(),
            clientId: musicData.clientId || 'unknown'
        };

        musicEvents.push(event);

        if (musicEvents.length > MAX_EVENTS) {
            musicEvents = musicEvents.slice(-MAX_EVENTS);
        }

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

app.get('/api/music-events', (req, res) => {
    try {
        pruneExpiredEvents();
        const clientId = req.query.clientId || `viewer-${Date.now()}`;
        const sinceMs = Number(req.query.since || 0);
        const viewerAccess = claimOrTouchViewer(clientId);

        connectedClients.add(clientId);

        if (!viewerAccess.allowed) {
            return res.status(409).json({
                events: [],
                clientId,
                connectedClients: connectedClients.size,
                timestamp: new Date().toISOString(),
                isActiveViewer: false,
                activeViewerClientId: viewerAccess.active,
                error: 'VIEWER_ALREADY_ACTIVE'
            });
        }

        const filteredEvents = sinceMs > 0
            ? musicEvents.filter((event) => new Date(event.timestamp).getTime() > sinceMs)
            : musicEvents;

        res.json({
            events: filteredEvents,
            clientId,
            connectedClients: connectedClients.size,
            timestamp: new Date().toISOString(),
            isActiveViewer: true,
            activeViewerClientId: viewerAccess.active
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in music-events endpoint:`, error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'SERVER_ERROR'
        });
    }
});

app.post('/api/heartbeat', (req, res) => {
    const clientId = req.body.clientId;
    if (clientId) {
        connectedClients.add(clientId);
        const viewerAccess = claimOrTouchViewer(clientId);
        if (!viewerAccess.allowed) {
            return res.status(409).json({
                success: false,
                error: 'VIEWER_ALREADY_ACTIVE',
                activeViewerClientId: viewerAccess.active
            });
        }
    }
    res.json({ success: true });
});

app.get('/api/status', (req, res) => {
    res.json({
        connectedClients: connectedClients.size,
        latestEvent: musicEvents[musicEvents.length - 1] || null
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, apiKey, model, history } = req.body;
        const configuredKey = process.env.OPENROUTER_API_KEY || settings.ai?.api_key || '';
        const effectiveApiKey = apiKey || configuredKey;

        if (!message || !effectiveApiKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing message or API key'
            });
        }

        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant for the APPM project (Magic Spotify Application). You are specialized in Google Maps, music streaming, and web development. Respond in Spanish when appropriate. Be concise and helpful.'
            },
            ...(history || []),
            {
                role: 'user',
                content: message
            }
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${effectiveApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://appm-magic.vercel.app',
                'X-Title': 'APPM Magic Show'
            },
            body: JSON.stringify({
                model: model || settings.ai?.model || 'anthropic/claude-3.5-sonnet:free',
                messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            return res.json({
                success: false,
                error: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
            });
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || 'No response from AI';

        res.json({
            success: true,
            response: aiResponse
        });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.json({
            success: false,
            error: `Server error: ${error.message}`
        });
    }
});

const PORT = process.env.PORT || settings.server?.port || 3000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`APPM Server running at http://localhost:${PORT}`);
        console.log(`Chat endpoint available at http://localhost:${PORT}/api/chat`);
    });
}

module.exports = (req, res) => {
    app(req, res);
};
