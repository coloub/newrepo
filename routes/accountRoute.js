const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

// Define the GET route for the account view
router.get('/', accountController.buildLogin);

// Error handler middleware
router.use((err, req, res, next) => {
    console.error(err); // Log the error
    req.flash("notice", "An error occurred during registration. Please try again."); // Flash message for the user
    res.status(500).send('Something went wrong!'); // Send a generic error response
});

router.get('/register', accountController.buildRegister); // Add registration route
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Export the router
module.exports = router;
