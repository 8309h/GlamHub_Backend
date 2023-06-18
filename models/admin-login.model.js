let mongoose = require("mongoose");

let adminLoginSchema = mongoose.Schema(
    {
    email: { type: String, required: true },
    password: { type: String , required:true },
    key: { type:String}
  }
);

let AdminLoginModel = mongoose.model("admin", adminLoginSchema);

module.exports ={AdminLoginModel};