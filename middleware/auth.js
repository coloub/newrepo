const jwt = require("jsonwebtoken")
require("dotenv").config()

// Middleware para verificar que el usuario es un empleado o administrador
function checkEmployeeAdmin(req, res, next) {
  if (res.locals.loggedin) {
    const accountType = res.locals.accountData.account_type
    if (accountType === "Employee" || accountType === "Admin") {
      next()
    } else {
      req.flash("notice", "Acceso denegado")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Por favor inicie sesión")
    return res.redirect("/account/login")
  }
}

module.exports = { checkEmployeeAdmin }