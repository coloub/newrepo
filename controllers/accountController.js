const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require('../utilities/index')

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
*  Deliver account management view
* *************************************** */
accountController.buildAccountManagement = async (req, res, next) => {
    let nav = await utilities.getNav();
    res.render("account/accountManagement", {
        title: "Account Management",
        nav,
    });
};
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.flash("success", "You're now logged in") // Añade un mensaje de éxito
      return res.redirect("/accountManagement") // Redirect to account management view
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

accountController.accountLogin = accountLogin; // Add the new function to the controller

module.exports = accountController;
