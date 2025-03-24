const utilities = require('../utilities/index'); // Import utilities
console.log("buildLogin function called"); // Log to check if the function is executed

const accountController = {};



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

accountController.getAccountView = (req, res) => {

    res.render('account/index', { title: 'My Account' }); // Adjust the view path as necessary
};



module.exports = accountController;
