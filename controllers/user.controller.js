const { UserModel } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let { Redis } = require("ioredis");

// io-redis setup
const client = new Redis({
  port: 10362,
  host: "redis-10362.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  password: "jrAD8AzZjLomuBMPyuF4nz0rUG4hg1Kg",
});

client.on("connect", () => {
  console.log("Connected to Redis Cloud");
});

client.on("error", (err) => {
  console.error("Error connecting to Redis Cloud:", err);
});

require("dotenv").config();
let sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

// register user/ signup user
const registerNewUser = async (req, res) => {
  try {
    const { first_name, last_name, gender, email, password } = req.body;
    const isUserPresent = await UserModel.findOne({ email });

    // all fields presence check
    if (!first_name || !last_name || !gender || !email || !password) {
      return res.status(400).send({ msg: "All feilds are required" });
    }

    // User already present in database.
    if (isUserPresent) {
      return res
        .status(400)
        .send({ msg: "Email already taken, try another email or login" });
    }

    // Hash the password.
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new UserModel({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(200).send({ msg: "Registration successful", user: newUser });
  } catch (error) {
    res.status(500).send({ error: "Registration failed", msg: error.message });
  }
};

// login user/signin user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserPresent = await UserModel.findOne({ email });

    // User not present in the database.
    if (!isUserPresent)
      return res
        .status(400)
        .send({ msg: "Not a existing user, please register" });

        

    // Password verification
    const isPasswordCorrect = bcrypt.compareSync(
      password,
      isUserPresent.password
    );

    if (!isPasswordCorrect)
      return res.status(400).send({ msg: "Wrong credentials" });

     
    // Generating access token
    const accessToken = jwt.sign(
      { userId: isUserPresent._id },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: 60 * 60 * 24 }
    );

    // Generating refresh token
    const refreshToken = jwt.sign(
      { userId: isUserPresent._id },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: 60 * 60 * 24 * 4 }
    );

    // Storing tokens in cookies.
    res.cookie("JAA_access_token", accessToken, { maxAge: 60 * 60 * 24 * 100 });
    res.cookie("JAA_refresh_token", refreshToken, {
      maxAge: 60 * 60 * 24 * 4 * 100,
    });
     let emailpass = isUserPresent.email;
     let namepas = isUserPresent.first_name;
    res.status(200).send({ msg: "Login success", accessToken, refreshToken,emailpass,namepas});
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

// logout user
const logoutUser = async (req, res) => {
  try {
    const { JAA_access_token, JAA_refresh_token } = req?.cookies;
    if (!JAA_access_token || !JAA_refresh_token)
      return res.status(400).send({ msg: "Unauthorized!" });

    client.mset(
      JAA_access_token,
      JAA_access_token,
      JAA_refresh_token,
      JAA_refresh_token
    );

    res.status(200).send({ msg: "Logout successful!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error.message });
  }
};

// New Access token generate
const NewAccessToken = async (req, res) => {
  try {
    const { JAA_refresh_token } = req?.cookies;

    // Checking if refreshtoken is expired or not.
    jwt.verify(
      JAA_refresh_token,
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
              { userId: payload._id },
              process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
              { expiresIn: "24hr" }
            );

            // Seting token in cookie again
            res.cookie("JAA_access_token", newAccessToken, {
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

// sending otp using sandgrid
var OTP;

const getotp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  OTP = otp;
  client.set(email, email, "EX", 60 * 60 * 1000);
  client.get(email);
  console.log(email);
  const msg = {
    to: email,
    from: "harshalwagh201718@gmail.com",
    subject: "Your OTP for Password Change",
    text: `Hi!, welcome to GLAMHUB!`,
    html: `<h2>Hello User</h2>
          <h2>Welcome to GLAMHUB</h2>
           <h3>As requested, we are sending you a One-Time Password (OTP) to facilitate your password change process. Please find your OTP below:</h3>
           <h2>OTP:${otp}</h2>
           <h3>Thank you for choosing GLAMHUB for your account management needs.<br/>Best regards,<br/>
               Team GLAMHUB</h3>
           `,
  };

  try {
    await sgMail.send(msg);

    console.log("OTP sending successful");
    console.log("Received OTP value: ", otp);

    // Store the OTP value in the session
    req.session.otp = otp;
    console.log("Stored OTP value: ", req.session.otp);
    res.send({ msg: "OTP is sent to email" });
  } catch (error) {
    console.log("error sending mail");
    console.log(error);
    res.status(500).send({ msg: "Not able to send OTP to email" });
  }
};

// Verify otp
const verifyotp = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = OTP;
    console.log(otp, storedOtp);

    if (otp == storedOtp) {
      console.log("OTP verification successful");

      res.send({ msg: "OTP verification successful" });
    } else {
      console.log("OTP verification failed");
      res.status(400).send({ msg: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

// reset password
const resetpassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    let useremail = await client.get(email);
    console.log(useremail);
    if (!useremail) {
      return res
        .status(400)
        .send({ msg: "You cannot change password of this email" });
    } else {
      const newhashedPassword = bcrypt.hashSync(password, 8);
      let justcheck = await UserModel.findOneAndUpdate(
        { email: useremail },
        { password: newhashedPassword }
        // { new: true }
      );
      res.status(200).send({ msg: "Successfuly password changed", justcheck });
    }
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

module.exports = {
  registerNewUser,
  loginUser,
  logoutUser,
  NewAccessToken,
  client,
  getotp,
  verifyotp,
  resetpassword,
};