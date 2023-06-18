const salonRouter = require("express").Router();

const {
  registerNewSalon,
  getAllSalon,
  updateSalonDetails,
  registerNewAdmin,
  loginAdmin,
  newAdminAccessToken,
} = require("../controllers/admin.controller");

const { authAdmin } = require("../middlewares/auth.admin");

salonRouter.post("/register", registerNewAdmin);

salonRouter.post("/login", loginAdmin);

salonRouter.post("/refresh-token", newAdminAccessToken);

salonRouter.post("/register-salon", registerNewSalon);

salonRouter.post("/salons", getAllSalon);

salonRouter.post("/update-details", updateSalonDetails);

module.exports = { salonRouter };
