let mongoose = require("mongoose");

let salonSchema = mongoose.Schema({
  image: { type: String },
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  contact: { type: Number, required: true },
  city: { type: String, required: true },
  services: {
    Hair: [
      {
        name: { type: String },
        desc: { type: String },
        price: { type: String },
        time: { type: String },
      },
    ],
    Face: [
      {
        name: { type: String },
        desc: { type: String },
        price: { type: String },
        time: { type: String },
      },
    ],
    Body: [
      {
        name: { type: String },
        desc: { type: String },
        price: { type: String },
        time: { type: String },
      },
    ],
  },
  slots:{
    "10:00":{type:Boolean,default:true},
    "11:00":{type:Boolean,default:true},
    "12:00":{type:Boolean,default:true},
    "13:00":{type:Boolean,default:true},
    "14:00":{type:Boolean,default:true},
    "15:00":{type:Boolean,default:true},
    "16:00":{type:Boolean,default:true},
    "17:00":{type:Boolean,default:true},
    "18:00":{type:Boolean,default:true}
  }
});

let SalonModel = mongoose.model("salon", salonSchema);

module.exports = { SalonModel };
