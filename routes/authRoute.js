const express = require("express");

//controllers
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

//routes
/**
 * @swagger
 *components:
 *  schemas:
 *      USERS:
 *         type: object
 *         required:
 *          - email
 *          - password
 *         properties:
 *            _id:
 *              type: string
 *              description: The auto-generated id of the user
 *            email:
 *              type: string
 *              description: The email of the user
 *            password:
 *              type: string
 *              description: The password of the user
 *
 */
router.post("/register", authController.register);
router.get("/verify/:id", authController.verifyUser);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

// Actions can be taken by admin
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
