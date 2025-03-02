// server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes'); // Import manga routes
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');


app.use(helmet());
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (!req.secure) {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

app.use(limiter);






app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes); // Use manga routes under /api/manga

// Connect to MongoDB
require('./config/db');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));