const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
    },
    cover: {
      type: String,
      required: [true, "Cover is required!"],
    },
    date: {
      type: String,
      required: [true, "Date is required!"],
    },
    location: {
      type: String,
      required: [true, "Location is required!"],
    },
    time: {
      type: String,
      required: [true, "Time is required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
