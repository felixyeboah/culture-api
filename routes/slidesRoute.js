const express = require("express");

const slidesController = require("../controllers/slidesController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", slidesController.getSlides);
router.delete("/:id", slidesController.deleteSlide);
router.post(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  slidesController.uploadSlides
);

module.exports = router;
