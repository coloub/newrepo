const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const validate = require('../middleware/validate');


// Define the GET route for the account view
router.get('/', utilities.checkLogin, accountController.buildAccountManagement);

router.use((err, req, res, next) => {
    console.error(err); // Log the error
    req.flash("notice", "An error occurred during registration. Please try again."); // Flash message for the user
    res.status(500).send('Something went wrong!'); // Send a generic error response
});

router.get('/register', accountController.buildRegister); // Add registration route
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));


router.get('/login', accountController.buildLogin);
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get('/update/:account_id', 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountUpdate)
);

router.post('/update/:account_id',
  utilities.checkLogin, // Verify user is logged in
  validate.accountUpdateRules(), // Validate input fields
  validate.checkUpdateData, // Process validation results
  utilities.handleErrors(accountController.updateAccount) // Handle controller errors
);

router.post('/update-password/:account_id',
  utilities.checkLogin, // Verify user is logged in
  validate.passwordUpdateRules(), // Validate password requirements
  validate.checkPasswordUpdate, // Process validation results
  utilities.handleErrors(accountController.updatePassword) // Handle controller errors
);




// Logout route
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

// Export the router
module.exports = router;