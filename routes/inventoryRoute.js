// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to get vehicle detail view
router.get("/detail/:id", invController.getVehicleDetail);

module.exports = router;