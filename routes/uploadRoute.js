const express = require("express");
const uploadController = require("../controllers/uploadController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", uploadController.getImages);
router.get("/:slug", uploadController.getSingleImage);

//protected  and by admin only
router.use(authController.protect, authController.restrictTo("admin"));
router
  .route("/")
  .post(uploadController.uploadGalleryImages, uploadController.uploads)
  .patch(uploadController.deleteImage);

module.exports = router;
