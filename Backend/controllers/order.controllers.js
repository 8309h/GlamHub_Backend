const { OrderModel } = require("../models/orders.model")
const registerOrder = async (req, res) => {
  try {
    const newOrder = new OrderModel({ ...req.body });
    await newOrder.save();
    res.status(200).send({ msg: "Order save successful", order: newOrder });
  } catch (error) {
    res.status(500).send({ error: " Saved failed", msg: error.message });
  }
};



require("dotenv").config();
let sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const orderconformmailUser = async (req, res) => {

  try {

    const emailprasent = await OrderModel.findOne({ email });

    if (emailprasent) {
      const msg = {
        to: email,
        from: "harshalwagh201718@gmail.com",
        subject: "Booking Confirmation",
        text: `Hi! We look forward to seeing you at the salon on today.`,
        html: `<h2>Hello User,</h2>
                <h2>Welcome to GLAMHUB!</h2>
                <h3>We look forward to seeing you in the salon today.</h3>
                <h3>Location: Salon Address</h3>
                <p>Thank you for choosing GLAMHUB for your salon appointment.</p>
                <p>Best regards,<br/>
                Team GLAMHUB</p>`,
      };
      await sgMail.send(msg);
      res.send({ msg: "BOOKING CONFORMED" });

    }

  } catch (err) {
    res.status(500).send({ error: "Sending Email failed"});
  }


};

module.exports = {
  orderconformmailUser,
  registerOrder
}