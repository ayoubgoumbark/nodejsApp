// Import mongoose
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB (the database 'mangaSiteDB' will be created if it doesn't exist)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/LocalDb', { useNewUrlParser: true, useUnifiedTopology: true ,
    ssl: true, // Enable SSL for secure connections

})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Export the models for use in other parts of the application
module.exports = {
    User: require('../models/User'),
    Manga: require('../models/postsModel'),
    Transaction: require('../models/Transaction')
};


