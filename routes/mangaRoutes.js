const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const authMiddleware = require('../middlewares/authMiddleware'); // Protect certain routes
const { upload } = require('../config/gridfs');

// Upload PDF and cover image for a manga
router.post('/upload', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), mangaController.uploadMangaFiles);

// Get PDF or cover file by file ID
router.get('/file/:fileId', mangaController.getFile);
// routes/mangaRoutes.js
router.get('/categories', mangaController.getAllCategories);

// Get mangas by category
router.get('/category/:category', mangaController.getMangasByCategory);

// Get all mangas
router.get('/all', mangaController.getAllMangas);


// Search for mangas
router.get('/search', mangaController.searchMangas);

// Get all free mangas
router.get('/free', mangaController.getFreeMangas);

// Get manga details (with restricted access for paid mangas)
router.get('/:id', authMiddleware.verifyToken, mangaController.getMangaDetails); // Protect this route with JWT

module.exports = router;