const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", orderController.getOrders);
router.post("/", authController.protect, orderController.createOrder);
router.post("/payment-hook", orderController.createPaymentHook);

module.exports = router;
