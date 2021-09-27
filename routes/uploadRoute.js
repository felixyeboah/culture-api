const express = require("express");
const uploadController = require("../controllers/uploadController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", uploadController.getImages);

//protected  and by admin only
router.use(authController.protect);
router.get("/:slug", uploadController.getSingleImage);

router.use(authController.restrictTo("admin"));
router
  .route("/")
  .post(uploadController.uploadGalleryImages, uploadController.uploads)
  .patch(uploadController.deleteImage);

router.patch(
  "/:id",
  uploadController.updateGalleryCover,
  uploadController.updateGallery
);

module.exports = router;
