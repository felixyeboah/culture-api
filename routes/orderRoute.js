const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/payment-hook", orderController.createPaymentHook);
router.route("/checkout-url").post(orderController.saveCheckoutUrl);
router.route("/saved-url").post(orderController.getSavedCheckoutUrl);
router.post("/", orderController.createOrder);
router.route("/:id").get(orderController.getOrder);

router.use(authController.protect);
router.use(authController.restrictTo("admin", "checker"));
router
  .route("/")
  .get(orderController.getOrders)
  .patch(orderController.updateOrder);
router.route("/sales").get(orderController.getSales);
router.route("/send-email").post(orderController.sendQRCode);
router.route("/generate-ticket").post(orderController.generateQRCode);
router.route("/pending-orders").delete(orderController.deleteUnsucessfulOrders);
router.route("/:id").delete(orderController.deleteOrder);

module.exports = router;
