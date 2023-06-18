const { SalonModel } = require("../models/salon.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const salonData = async (req, res) => {
  const { JAA_access_token } = req?.cookies;

  let decoded = jwt.verify(
    JAA_access_token,
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY
  );

  let { image, name, address, contact, city, services, search, fields } =
    req.query;
  try {
    if (decoded) {
      let query = {};
      if (search) {
        query["$or"] = fields
          .split(",")
          .map((field) => ({ [field]: { $regex: search, $options: "i" } }));
      }

      if (image) {
        query.image = { $regex: image, $options: "i" };
      }
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }
      if (address) {
        query.address = { $regex: address, $options: "i" };
      }
      if (contact) {
        query.contact = { $regex: contact, $options: "i" };
      }
      if (city) {
        query.city = { $regex: city, $options: "i" };
      }
      if (services) {
        query.services = {
          $or: [
            {
              "services.Hair": {
                $elemMatch: { $regex: services, $options: "i" },
              },
            },
            {
              "services.Face": {
                $elemMatch: { $regex: services, $options: "i" },
              },
            },
            {
              "services.Body": {
                $elemMatch: { $regex: services, $options: "i" },
              },
            },
          ],
        };
      }

      let salons = await SalonModel.find(query);
      res.status(200).send({ msg: `Here are all the tasks `, salons });
    }
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

module.exports = {
  salonData
};
