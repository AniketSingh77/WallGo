const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const wallpaperRoutes = require('./routes/wallpaperRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://www.wallgo.in', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check & Root Route (Prevention for Sleep/404)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'WallGo API is ACTIVE', status: 'OK', version: '1.2.1' });
});

app.get('/api/health', (req, res) => {
    res.status(200).send('Server is running');
});

// Cron Keep-Alive Route (Requested for WEXA/WallGo stability)
app.get('/api/cron/run', (req, res) => {
    console.log('Vitality check triggered at:', new Date().toISOString());
    res.status(200).json({ success: true, message: 'Keep-alive signal received' });
});

// Routes
app.use('/api/wallpapers', wallpaperRoutes);

// MongoDB Connection (Asynchronous to prevent app hang)
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('WARNING: MONGODB_URI is not defined in environment variables.');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Don't exit, let the server keep running for health checks
    }
};

connectDB();

// Start Server Independently of DB
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
