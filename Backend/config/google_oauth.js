const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/user/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log(profile);

      let user = {
        first_name: profile._json.name.split(" ")[0],
        last_name: profile._json.name.split(" ")[1],
        gender: profile._json.gender,
        email: profile._json.email,
        password: uuidv4(),
      };
      console.log(user);
      return cb(null, user);
    }
  )
);

module.exports = { passport };
