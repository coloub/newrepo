// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Ruta para la vista de gestión de inventario
router.get("/inv", invController.showManagementView);

// Ruta para la vista de agregar clasificación
router.get("/add-classification", invController.showAddClassificationView);

// Ruta para la vista de agregar inventario
router.get("/add-inventory", invController.showAddInventoryView);

// Route to get inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get vehicle detail view
router.get("/detail/:id", invController.getVehicleDetail);

module.exports = router;
