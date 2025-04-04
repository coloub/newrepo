const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
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
accountController.registerAccount = async (req, res) => {
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
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async (req, res) => {
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
      req.flash("success", "You're now logged in")
      return res.redirect("/account")
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
};

/* ****************************************
*  Deliver account update view
* *************************************** */
accountController.buildAccountUpdate = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
  })
};

/* ****************************************
*  Process Account Update
* *************************************** */
accountController.updateAccount = async (req, res, next) => {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  
  if (updateResult instanceof Error) {
    req.flash("notice", "Update failed. Please try again.")
    res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: await accountModel.getAccountById(account_id),
    })
    return
  }
  
  // Get the updated account data
  const accountData = await accountModel.getAccountById(account_id)
  // Update the session with new data
  req.session.accountData = accountData
  
  req.flash("success", "Account updated successfully.")
  res.redirect("/account/")
};

/* ****************************************
*  Process Password Update
* *************************************** */
accountController.updatePassword = async (req, res, next) => {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // Regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Password update failed. Please try again.")
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: await accountModel.getAccountById(account_id),
    })
    return
  }
  
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  
  if (updateResult instanceof Error) {
    req.flash("notice", "Password update failed. Please try again.")
    res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: await accountModel.getAccountById(account_id),
    })
    return
  }
  
  req.flash("success", "Password updated successfully.")
  res.redirect("/account/")
};

/* ****************************************
*  Process logout request
* *************************************** */
accountController.accountLogout = (req, res) => {
  res.clearCookie("jwt")
  req.flash("success", "You have been logged out")
  res.redirect("/")
};

module.exports = accountController;
