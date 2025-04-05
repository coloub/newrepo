const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');


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

router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));
router.post('/update/:account_id', utilities.handleErrors(accountController.updateAccount));

router.get('/update-password/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildPasswordUpdate));
router.post('/update-password/:account_id', utilities.handleErrors(accountController.updatePassword));


// Temporary test route - REMOVE AFTER TESTING
router.get('/test-password/:password', async (req, res) => {
  try {
    const password = req.params.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashedPassword);
    
    res.json({
      originalPassword: password,
      hashedPassword: hashedPassword,
      passwordMatch: match,
      hashLength: hashedPassword.length
    });
  } catch (error) {
    res.json({error: error.message});
  }
});

// Temporary route to fix password - REMOVE AFTER USE
router.get('/fix-password/:email', async (req, res) => {
  try {
    const email = req.params.email;
    
    // Get the account
    const account = await accountModel.getAccountByEmail(email);
    
    if (!account) {
      return res.send('Account not found');
    }
    
    // Get the current plain text password
    const plainPassword = account.account_password;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log("Original password:", plainPassword);
    console.log("Hashed password:", hashedPassword);
    
    // Update the password
    await accountModel.updatePassword(hashedPassword, account.account_id);
    
    res.send('Password hashed successfully. You can now log in with your same password.');
  } catch (error) {
    console.error(error);
    res.send('Error fixing password: ' + error.message);
  }
});



// Logout route
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

// Export the router
module.exports = router;
