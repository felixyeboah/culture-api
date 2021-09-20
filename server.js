require("dotenv").config();
const mongoose = require("mongoose");
const consola = require("consola");

const app = require("./app");

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
