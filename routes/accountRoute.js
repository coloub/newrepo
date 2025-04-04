const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

// Define the GET route for the account view
router.get('/', utilities.checkLogin, accountController.buildAccountManagement);

router.get('/accounts', accountController.buildAccountManagement); // Add new accounts route

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

router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));
router.post('/update/:account_id', utilities.handleErrors(accountController.updateAccount));

router.get('/update-password/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildPasswordUpdate));
router.post('/update-password/:account_id', utilities.handleErrors(accountController.updatePassword));


// Logout route
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

// Export the router
module.exports = router;
