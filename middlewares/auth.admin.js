const jwt = require("jsonwebtoken");
require("dotenv").config();
const { client } = require("../controllers/user.controller");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));



let authAdmin = async (req, res, next) => {
  // const { Admin_access_token, Admin_refresh_token } = req.cookies;
  // console.log(Admin_access_token)
  // next()

  const Admin_access_token=req.headers.authorization

  if (!Admin_access_token) {
    return res.status(400).send({ msg: "Please login!" });
  } else {
    const isTokenBlacklisted = await client.get(Admin_access_token);

    if (isTokenBlacklisted !== null) {
      return res.send({ msg: "please login again, already logged out" });
    } else {
      jwt.verify(
        Admin_access_token,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        async (err, payload) => {
          if (!payload) {
            if (err.message == "jwt expired") {
              try {
                const token = await fetch(
                  "http://localhost:4000/admin/refresh-token", //----
                  {
                    headers: {
                      "content-type": "application/json"
                    },
                  }
                );
                let resp = await token.json();
                if (resp.msg == "Token generated") {
                  const newPayload = jwt.verify(resp.token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
                  req.body.adminId = newPayload.adminId;
                  next();
                } else {
                  res.status(400).send({ msg: "Please login" });
                }
              } catch (error) {
                res.status(500).send({ msg: error.message });
              }
            } else if (payload) {
              req.body.adminId = payload._id;
              next();
            } else {
              res.status(400).send({ msg: err.message });
            }
          } else {
            req.body.adminId = payload._id;
            next();
          }
        }
      );
    }
  }
};

module.exports = { authAdmin };