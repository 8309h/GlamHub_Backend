let mongoose = require("mongoose");

let userSchema = mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    versionKey: false,
  }
);

let UserModel = mongoose.model("user", userSchema);

module.exports = {
  UserModel,
};
