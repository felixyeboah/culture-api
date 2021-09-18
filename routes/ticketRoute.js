const express = require("express");
const ticketController = require("../controllers/ticketController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.get("/", orderController.getOrders);
router.post(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  ticketController.createTicket
);

module.exports = router;
