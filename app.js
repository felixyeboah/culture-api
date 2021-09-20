const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const swaggerJsdoc = require("swagger-jsdoc");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

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

const specs = swaggerJsdoc(options);

const app = express();

app.enable("trust proxy");

//Swagger API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//routes
const userRoutes = require("./routes/authRoute");
const uploadRoutes = require("./routes/uploadRoute");
const slidesRoutes = require("./routes/slidesRoute");
const orderRoute = require("./routes/orderRoute");
const eventRoute = require("./routes/eventRoute");
const ticketRoute = require("./routes/ticketRoute");

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

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/gallery", uploadRoutes);
app.use("/api/v1/slides", slidesRoutes);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/events", eventRoute);
app.use("/api/v1/tickets", ticketRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
