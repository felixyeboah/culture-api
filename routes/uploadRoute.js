const express = require("express");
const uploadController = require("../controllers/uploadController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", uploadController.getImages);
router.post(
  "/upload",
  authController.protect,
  authController.restrictTo("admin"),
  uploadController.uploads
);

module.exports = router;
