const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const supabase = require('./supa');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const password = req.headers['x-dashboard-password'];
    if (password === process.env.DASHBOARD_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Helper to hash IP
const hashIp = (ip) => {
    return crypto.createHash('sha256').update(ip).digest('hex');
};

// --- Routes ---

// 1. Create a new link (Protected)
app.post('/api/links', authMiddleware, async (req, res) => {
    const { destination_url, custom_slug } = req.body;

    if (!destination_url) {
        return res.status(400).json({ error: 'Destination URL is required' });
    }

    let slug = custom_slug;
    if (!slug) {
        // Generate random 6-char slug
        slug = crypto.randomBytes(3).toString('hex');
    }

    const { data, error } = await supabase
        .from('links')
        .insert([{ slug, destination_url }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Slug already exists' });
        }
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// 2. Dashboard Stats (Protected)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    // Aggregate stats via code for simplicity, or could use RPC/views.
    // For MVP, perform two queries: get all links, get counts.

    // Actually, let's get links and attach click counts.
    // Supabase/Postgres count is easy.

    const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

    if (linksError) return res.status(500).json({ error: linksError.message });

    // Get click counts for all links
    // This might be heavy if millions of clicks, but fine for solo MVP.
    // Optimized: group by link_id count in SQL is better but requires RPC or advanced query.
    // Simple: select link_id from clicks.

    const { data: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select('link_id, created_at, ip_hash');

    if (clicksError) return res.status(500).json({ error: clicksError.message });

    // Process in memory
    const stats = links.map(link => {
        const linkClicks = clicks.filter(c => c.link_id === link.id);
        const totalClicks = linkClicks.length;

        // Unique clicks (IP per day)
        const unique = new Set();
        linkClicks.forEach(c => {
            const day = new Date(c.created_at).toISOString().split('T')[0];
            unique.add(`${c.ip_hash}-${day}`);
        });
        const lastClicked = linkClicks.length > 0
            ? linkClicks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
            : null;

        return {
            ...link,
            total_clicks: totalClicks,
            unique_clicks: unique.size,
            last_clicked: lastClicked
        };
    });

    res.json(stats);
});

// 3. Redirect Endpoint (Public)
app.get('/r/:slug', async (req, res) => {
    const { slug } = req.params;

    // Find link
    const { data: link, error } = await supabase
        .from('links')
        .select('id, destination_url')
        .eq('slug', slug)
        .single();

    if (error || !link) {
        return res.status(404).send('Link not found');
    }

    // Redirect immediately
    res.redirect(302, link.destination_url);

    // Log click asynchronously
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const ipHash = hashIp(ip || 'unknown');

    await supabase.from('clicks').insert({
        link_id: link.id,
        ip_hash: ipHash,
        user_agent: userAgent
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
