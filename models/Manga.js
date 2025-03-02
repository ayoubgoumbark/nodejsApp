const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    pdfFileId: String, // Reference to the PDF file in GridFS
    coverFileId: String, // Reference to the cover image in GridFS
    isFree: Boolean,
    category: [String]
});

module.exports = mongoose.model('Manga', mangaSchema);