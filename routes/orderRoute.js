const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/payment-hook", orderController.createPaymentHook);
router.get("/:id", orderController.getOrder);

router.use(authController.protect);
router.post("/", orderController.createOrder);

router.use(authController.restrictTo("admin"));
router.get("/", orderController.getOrders);
router.route("/:id").delete(orderController.deleteOrder);

module.exports = router;
