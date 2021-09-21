const express = require("express");
const ticketController = require("../controllers/ticketController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(ticketController.getAllTickets);
router.route("/:id").get(ticketController.getTicket);

//protected and by admin only
router.use(authController.protect, authController.restrictTo("admin"));
router.route("/").post(ticketController.createTicket);

router
  .route("/:id")
  .patch(ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

module.exports = router;
