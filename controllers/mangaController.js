const Manga = require('../models/Manga');
const { gfs } = require('../config/gridfs');

// Upload manga files (PDF and cover image)
exports.uploadMangaFiles = async (req, res) => {
    try {
        const { pdf, cover } = req.files; // Files uploaded via multer

        if (!pdf || !cover) {
            return res.status(400).send('Both PDF and cover image are required.');
        }

        const newManga = new Manga({
            title: req.body.title,
            description: req.body.description,
            price: parseFloat(req.body.price),
            pdfFileId: pdf[0].id, // Store the GridFS file ID
            coverFileId: cover[0].id, // Store the GridFS file ID
            isFree: req.body.isFree === 'true',
            category: req.body.category.split(',')
        });

        await newManga.save();
        res.status(201).json({ message: 'Manga uploaded successfully', manga: newManga });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Retrieve a file by its GridFS ID
exports.getFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;

        // Check if the file exists in GridFS
        const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) });
        if (!file) {
            return res.status(404).send('File not found.');
        }

        // Check if the file is a PDF (based on MIME type)
        if (file.contentType === 'application/pdf') {
            // Find the manga associated with this PDF
            const manga = await Manga.findOne({ pdfFileId: file._id });
            if (!manga) {
                return res.status(404).send('Manga not found.');
            }

            // Check if the user has permission to access the PDF
            if (!req.user || (!manga.isFree && req.user.balance < manga.price)) {
                return res.status(403).send('Access denied.');
            }
        }

        // Stream the file to the client
        const readStream = gfs.createReadStream({ _id: file._id });
        readStream.on('error', (err) => {
            res.status(500).send(err.message);
        });
        readStream.pipe(res); // Send the file as the response
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Fetch all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Manga.distinct('category'); // Get all unique categories
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Fetch mangas by category
exports.getMangasByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        // Use MongoDB's `$in` operator to match any manga whose category array includes the given category
        const mangas = await Manga.find({ category: { $in: [category] } });

        if (mangas.length === 0) {
            return res.status(404).json({ message: 'No mangas found in this category.' });
        }

        res.status(200).json(mangas); // Send the list of mangas as JSON response
    } catch (error) {
        res.status(500).send(error.message); // Handle errors appropriately
    }
};

// Fetch all mangas
exports.getAllMangas = async (req, res) => {
    try {
        const mangas = await Manga.find(); // Retrieve all mangas from the database
        res.status(200).json(mangas); // Send the list of mangas as JSON response
    } catch (error) {
        res.status(500).send(error.message); // Handle errors appropriately
    }
};



// Search for mangas by title or description
exports.searchMangas = async (req, res) => {
    try {
        const { query } = req.query; // Query string from the request
        if (!query) return res.status(400).send('Search query is required.');

        // Use MongoDB's text search or regex matching
        const results = await Manga.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Fetch all free mangas
exports.getFreeMangas = async (req, res) => {
    try {
        const freeMangas = await Manga.find({ isFree: true });
        res.status(200).json(freeMangas);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Fetch details of a specific manga
exports.getMangaDetails = async (req, res) => {
    try {
        const mangaId = req.params.id;
        const manga = await Manga.findById(mangaId);

        if (!manga) return res.status(404).send('Manga not found.');

        // If the manga is paid, restrict access unless user has purchased it
        if (!manga.isFree && !req.user?.balance >= manga.price) {
            const restrictedData = {
                _id: manga._id,
                title: manga.title,
                price: manga.price,
                coverUrl: manga.coverUrl // Assuming you store a cover image URL
            };
            return res.status(200).json(restrictedData);
        }

        // Return full manga data for free or purchased mangas
        res.status(200).json(manga);
    } catch (error) {
        res.status(500).send(error.message);
    }
};