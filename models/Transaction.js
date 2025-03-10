const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: String,
    mangaId: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);