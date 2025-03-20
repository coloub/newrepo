const utilities = require("../utilities/") // Ensure utilities are imported
const baseController = {}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
baseController.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

module.exports = baseController
