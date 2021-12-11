const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Ticket",
    },
    reference: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0.0,
    },
    invoiceId: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "success"],
      default: "pending",
    },
    url: {
      type: String,
    },
    checkoutUrl: {
      type: String,
    },
    guest: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", ordersSchema);

module.exports = Order;
