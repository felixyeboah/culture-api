const express = require("express");

//controllers
const authController = require("../controllers/authController");

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
router.get("/verify", authController.verifyUser);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);

module.exports = router;
