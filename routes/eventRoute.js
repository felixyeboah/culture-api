const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", eventController.getEvents);

// Actions can be taken by admin
router.use(authController.protect);
router.route("/:id").get(eventController.getEvent);

router.use(authController.restrictTo("admin"));
router
  .route("/")
  .post(eventController.uploadEventCover, eventController.createEvent);

router
  .route("/:id")
  .patch(eventController.uploadEventCover, eventController.updateEvent)
  .delete(eventController.deleteEvent);

module.exports = router;
