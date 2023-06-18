let mongoose = require("mongoose");

let orderSchema = mongoose.Schema(
  {
    servicename: { type: String },
    descService: { type: String },
    priceService: { type: String },
    timeService: { type: String },
    timeslot: { type: String },
    email: { type: String },
  },
  {
    versionKey: false,
  }
);

let OrderModel = mongoose.model("order", orderSchema);

module.exports = {
  OrderModel,
};
