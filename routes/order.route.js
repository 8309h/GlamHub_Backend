const {registerOrder, orderconformmailUser} =  require("../controllers/order.controllers")

 const orderRouter = require("express").Router();
 orderRouter.post("/addorder",registerOrder)
 orderRouter.post("/sendmail",orderconformmailUser)

module.exports = {
    orderRouter
    
}