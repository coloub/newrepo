const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const baseController = require("./baseController");

const invCont = {};

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
  res.render("./inventory/management", {
    title: "Gestión de Inventario",
    nav,
  });
});

/* ***************************
 *  Show add classification view
 * ************************** */
invCont.showAddClassificationView = baseController.handleErrors(async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Agregar Clasificación",
    nav,
  });
});

/* ***************************
 *  Show add inventory view
 * ************************** */
invCont.showAddInventoryView = baseController.handleErrors(async function (req, res, next) {
  const nav = await utilities.getNav();
  // Obtener las clasificaciones para el formulario
  const classifications = await invModel.getClassifications();
  let classificationSelect = '<select name="classification_id" required>';
  classificationSelect += '<option value="">Seleccione una clasificación</option>';
  classifications.rows.forEach(classification => {
    classificationSelect += `<option value="${classification.classification_id}">${classification.classification_name}</option>`;
  });
  classificationSelect += '</select>';

  res.render("./inventory/add-inventory", {
    title: "Agregar Vehículo",
    nav,
    classificationSelect: classificationSelect,
  });
});


module.exports = invCont;
