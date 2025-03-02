const mongoose = require('mongoose');
const multer = require('multer');
const { MongoClient } = require('mongodb'); // Use the official MongoDB driver

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

let db;

// Initialize MongoDB client once the connection is open
mongoose.connection.once('open', async () => {
    const client = await MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(); // Get the database instance
});

// Custom storage engine for multer
const storage = multer.memoryStorage(); // Store files in memory temporarily

// Middleware for handling file uploads
const upload = multer({ storage });

// Function to upload files to GridFS
async function uploadFileToGridFS(req, res) {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Ensure the GridFS bucket exists
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'fs' });

        // Create a write stream to upload the file
        const uploadStream = bucket.openUploadStream(`${Date.now()}-${req.file.originalname}`, {
            contentType: req.file.mimetype // Set MIME type
        });

        uploadStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).send('File upload failed.');
        });

        uploadStream.on('finish', () => {
            res.json({
                filename: uploadStream.filename,
                size: uploadStream.uploadedBytes,
                contentType: uploadStream.contentType // Include content type in response
            });
        });

        // Pipe the file data into the GridFS bucket
        uploadStream.write(req.file.buffer, () => {
            uploadStream.end();
        });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Internal server error.');
    }
}

module.exports = { upload, uploadFileToGridFS };