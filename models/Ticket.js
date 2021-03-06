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
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
      default: 0.0,
    },
    type: {
      type: String,
      enum: ["table", "ticket"],
      default: "table",
    },
    options: [String],
    quantity: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
