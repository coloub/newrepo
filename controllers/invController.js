const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const baseController = require("./baseController");

const invCont = {};

// Function to handle POST request for adding a new classification
invCont.addClassification = baseController.handleErrors(async function (req, res, next) {
    const { classification_name } = req.body;
    // Validate classification name
    if (!classification_name || !/^[a-zA-Z0-9]+$/.test(classification_name)) {
        req.flash('error', 'El nombre de la clasificación solo puede contener letras y números.');
        return res.redirect('/inv/add-classification');
    }
    // Insert classification into the database
    await invModel.addClassification(classification_name);
    req.flash('success', 'Clasificación agregada exitosamente.');
    res.redirect('/inv');
});

// Function to handle POST request for adding a new inventory item
invCont.addInventory = baseController.handleErrors(async function (req, res, next) {
    const { inv_make, inv_model, classification_id } = req.body;
    // Validate inputs
    if (!inv_make || !inv_model || !classification_id) {
        req.flash('error', 'Por favor, complete todos los campos.');
        return res.redirect('/inv/add-inventory');
    }
    // Insert inventory item into the database
    await invModel.addInventory(inv_make, inv_model, classification_id);
    req.flash('success', 'Vehículo agregado exitosamente.');
    res.redirect('/inv');
});

/* ***************************
 *  Get vehicle detail view
 * ************************** */
invCont.getVehicleDetail = baseController.handleErrors(async function (req, res, next) {
  const vehicleId = req.params.id;
  const vehicleData = await invModel.getVehicleById(vehicleId);
  if (vehicleData.length > 0) {
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: vehicleData[0].inv_make + " " + vehicleData[0].inv_model,
      nav,
      vehicle: vehicleData[0],
    });
  } else {
    res.status(404).render("errors/404", { title: "Vehicle Not Found" });
  }
});

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = baseController.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
});

/* ***************************
 *  Show inventory management view
 * ************************** */
invCont.showManagementView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications(); // Fetch classifications
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' '); // Concatenate messages
    res.render("./inventory/management", {
        title: "Gestión de Inventario",
        nav,
        classifications, // Pass classifications to the view
        flashMessage,
    });
});

/* ***************************
 *  Show add classification view
 * ************************** */
invCont.showAddClassificationView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' '); // Concatenate messages
    res.render("./inventory/add-classification", {
        title: "Agregar Clasificación",
        nav,
        flashMessage,
    });
});

/* ***************************
 *  Show add inventory view
 * ************************** */
invCont.showAddInventoryView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    let classificationSelect = '<select name="classification_id" required>';
    classificationSelect += '<option value="">Seleccione una clasificación</option>';
    classifications.rows.forEach(classification => {
        classificationSelect += `<option value="${classification.classification_id}">${classification.classification_name}</option>`;
    });
    classificationSelect += '</select>';
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' '); // Concatenate messages
    res.render("./inventory/add-inventory", {
        title: "Agregar Vehículo",
        nav,
        classificationSelect: classificationSelect,
        flashMessage,
    });
});

module.exports = invCont;
