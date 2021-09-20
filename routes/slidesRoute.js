const express = require("express");

const slidesController = require("../controllers/slidesController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", slidesController.getSlides);

//protected and by admin
router.use(authController.protect, authController.restrictTo("admin"));
router
  .route("/")
  .post(slidesController.uploadSlidesImages, slidesController.uploadSlides)
  .patch(slidesController.deleteSlide);

module.exports = router;
