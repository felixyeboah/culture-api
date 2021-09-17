const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    name: {
      type: String,
      required: [true, "Name is required!"],
    },
    people: {
      type: Number,
      required: [true, "Number of people is required!"],
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
      default: 0.0,
    },
    options: [String],
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
