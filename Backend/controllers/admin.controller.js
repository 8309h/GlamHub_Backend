const { SalonModel } = require("../models/salon.model");
const { AdminLoginModel } = require("../models/admin-login.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Creating a new salon
const registerNewSalon = async (req, res) => {
  try {
    const { name, address, contact, city, services } = req.body;
    const isSalonPresent = await SalonModel.findOne({ name });

    //   all fields presence check
    if (!name || !address || !contact || !city || !services) {
      return res.status(400).send({ msg: "All feilds are required" });
    }

    // Salon already present in database.
    if (isSalonPresent) {
      return res
        .status(400)
        .send({ msg: "Salon already parterned with us!" });
    }

    const newSalon = new SalonModel({ name, address, contact, city, services });
    await newSalon.save();
    res.status(200).send({ msg: "Salon registration successful" });
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: "Salon registration failed", msg: error.message });

  }
};

//Reading all salons
const getAllSalon = async (req, res) => {

  let { name } = req.body;

  try {
    if (name) {
      const salonInfo = await SalonModel.find({ name: { $regex: new RegExp(`.*${name}.*`, 'i') } })
      return res.send(salonInfo)
    } else {
      const salonInfo = await SalonModel.find()
      return res.send(salonInfo)
    }
  } catch (error) {
    res.status(400).send({ msg: "couldn't retrive data" })
  }
}

//Update a salon's details
const updateSalonDetails = async (req, res) => {
  let { _id } = req.body

  try {
    const salonInfo = await SalonModel.findByIdAndUpdate(_id, { ...req.body })
    res.send("Updated the details successfully!")
  } catch (error) {
    res.status(400).send({ msg: "couldn't retrive data" })
  }
}

//signup or registration for admin
const registerNewAdmin = async (req, res) => {
  let secret = "dvs45t"
  try {
    const { email, password, key } = req.body;
    const isPresent = await AdminLoginModel.findOne({ email });

    // all fields presence check
    if (!email || !password || !key) {
      return res.status(400).send({ msg: "All fields are required" });
    }

    if (key != secret) {
      return res.status(400).send({ msg: "Key is not valid!" })
    }

    //already present in database.
    if (isPresent) {
      return res.status(400).send({ msg: "Email already present!" });
    }

    // Hash the password.
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new AdminLoginModel({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(200).send({ msg: "Registration successful", user: newUser });
  } catch (error) {
    res.status(500).send({ error: "Registration failed", msg: error.message });
  }
}

// this is for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdminPresent = await AdminLoginModel.findOne({ email });

    // User not present in the database.
    if (!isAdminPresent)
      return res
        .status(400)
        .send({ msg: "Not a existing user, please register" });

    // Password verification
    const isPasswordCorrect = bcrypt.compareSync(password, isAdminPresent.password
    );

    if (!isPasswordCorrect) return res.status(400).send({ msg: "Wrong credentials" });

    // Generating access token
    const AdminAccessToken = jwt.sign(
      { adminId: isAdminPresent._id },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    // Generating refresh token
    const AdminRefreshToken = jwt.sign(
      { adminId: isAdminPresent._id },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: 60 * 60 * 24 * 4 }
    );

    // Storing tokens in cookies.
    res.cookie("Admin_access_token", AdminAccessToken, { maxAge: 60 * 60 * 24 * 1000, domain: "http://127.0.0.1:5500", path: "/pages" });
    res.cookie("Admin_refresh_token", AdminRefreshToken, { maxAge: 60 * 60 * 24 * 4 * 1000, domain: "http://127.0.0.1:5500", path: "/pages" });

    res.status(200).send({ msg: "Login success", AdminAccessToken, AdminRefreshToken });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// logout user
const logoutAdmin = async (req, res) => {
  try {
    const { Admin_access_token, Admin_refresh_token } = req?.cookies;
    if (!Admin_access_token || !Admin_refresh_token)
      return res.status(400).send({ msg: "Unauthorized!" });

    client.mset(
      Admin_access_token,
      Admin_access_token,
      Admin_refresh_token,
      Admin_refresh_token
    );

    res.status(200).send({ msg: "Logout successful!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error.message });
  }
};

// New Access token generate
const newAdminAccessToken = async (req, res) => {
  try {
    const { Admin_refresh_token } = req?.cookies;

    // Checking if refreshtoken is expired or not.
    jwt.verify(
      Admin_refresh_token,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      async (err, payload) => {
        if (err) {
          return res.status(401).send({ msg: err.message });
        } else {
          const isTokenBlacklisted = await client.get(JAA_refresh_token);
          if (isTokenBlacklisted) {
            return res.send({
              msg: "please login again, refreshed token also expried",
            });
          } else {
            const newAccessToken = jwt.sign(
              { adminId: payload._id },
              process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
              { expiresIn: "24hr" }
            );

            // Seting token in cookie again
            res.cookie("Admin_access_token", newAccessToken, {
              maxAge: 60 * 60 * 24,
            });

            res.status(200).send({ msg: "Token generated", newAccessToken });
          }
        }
      }
    );
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};


module.exports = { registerNewSalon, getAllSalon, updateSalonDetails, registerNewAdmin, loginAdmin, logoutAdmin, newAdminAccessToken };