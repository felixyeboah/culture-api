const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.post("/", orderController.createOrder);
router.post("/payment-hook", orderController.createPaymentHook);

router.use(authController.restrictTo("admin"));
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrder);

module.exports = router;
