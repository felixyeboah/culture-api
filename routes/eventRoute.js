const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.get("/", orderController.getOrders);
router.post(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  eventController.createEvent
);

module.exports = router;
