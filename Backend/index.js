let express = require("express");
const { connection } = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
let session = require("express-session");
const { userRouter } = require("./routes/user.route");
const { salonRouter } = require("./routes/admin.route");
const { glamSalonRouter } = require("./routes/salon.route");
const {orderRouter}  = require("./routes/order.route")

let app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: "chess secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// app.use(express.static(path.join(__dirname,"../Frontend")))

// // Basic endpoint
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname,"../Frontend/index.html"))
// });

app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/user", userRouter);

app.use("/admin",salonRouter);

app.use("/salon", glamSalonRouter);
app.use("/order",orderRouter)

app.listen(process.env.PORT, async () => {
  try {
    console.log(`server is live at port ${process.env.PORT}`);
    await connection;
    console.log("Connection established to MongoDB Atlas Database");
  } catch (error) {
    console.log("Not able to connect ot DB");
  }
});
