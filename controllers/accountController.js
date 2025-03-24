const utilities = require('../utilities/index'); // Import utilities
console.log("buildLogin function called"); // Log to check if the function is executed

const accountController = {};
const accountModel = require('../models/account-model'); // Import account model

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async (req, res, next) => {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
};

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async (req, res, next) => {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    });
};

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    );

    if (typeof regResult === 'string') {
        req.flash("notice", regResult); // Use the error message from the model
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: regResult // Pass the error message to the view
        });
        return; // Exit the function early if there's an error
    }

    req.flash("success", `Congratulations, you\'re registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", {
        title: "Login",
        nav,
    });
}

accountController.registerAccount = registerAccount; // Add the new function to the controller

module.exports = accountController;
