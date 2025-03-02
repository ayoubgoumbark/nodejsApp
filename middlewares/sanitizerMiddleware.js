// middleware/sanitizerMiddleware.js
const sanitizer = require('express-sanitizer');

app.use(sanitizer());
app.use((req, res, next) => {
    req.sanitizeBody('*'); // Sanitize all fields
    next();
});