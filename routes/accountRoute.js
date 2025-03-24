const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');

// Define the GET route for the account view
router.get('/', accountController.buildLogin);

// Error handler middleware
router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

router.get('/register', accountController.buildRegister); // Add registration route
router.post('/register', utilities.handleErrors(accountController.registerAccount));


// Export the router

module.exports = router;
