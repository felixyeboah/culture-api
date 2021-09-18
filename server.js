const express = require("express");
require("dotenv").config();
const consola = require("consola");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const multer = require("multer");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "API for Culture Curations Management",
    },
    servers: [{ url: "https://healthcaregh.herokuapp.com/api/v1" }],
  },
  apis: ["./routes/*.js"],
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const filesFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed*"), false);
  }
};

const upload = multer({
  storage,
  filesFilter,
});

const specs = swaggerJsdoc(options);

const app = express();

//Swagger API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//routes
const userRoutes = require("./routes/authRoute");
const uploadRoutes = require("./routes/uploadRoute");
const slidesRoutes = require("./routes/slidesRoute");
const orderRoute = require("./routes/orderRoute");
const eventRoute = require("./routes/eventRoute");
const ticketRoute = require("./routes/ticketRoute");

//connect to database
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.n6eix.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => consola.success("Database successfully connected"))
  .catch((error) => {
    consola.error("Database error:", error.message);
  });

//middlewares
app.options("*", cors());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api/v1", limiter);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//routes
app.use("/api/v1/users", userRoutes);
app.use(
  "/api/v1/gallery",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 450 },
  ]),
  uploadRoutes
);
app.use("/api/v1/slides", upload.array("slides", 30), slidesRoutes);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/events", upload.single("cover"), eventRoute);
app.use("/api/v1/tickets", ticketRoute);

//start server
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  consola.success(`Server started successfully on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
