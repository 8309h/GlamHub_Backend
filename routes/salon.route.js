const { salonData } = require("../controllers/salon.controller");
const glamSalonRouter = require("express").Router();

glamSalonRouter.get("/getsalon", salonData);

module.exports = { glamSalonRouter };
