const catchAsync = require("../utils/catchAsync");
const Order = require("../models/Order");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  if (!req.user._id) return next(new AppError("User is required!", 400));

  if (!req.body.ticket) return next(new AppError("Ticket is required!", 400));

  const order = await Order.create({
    user: req.user._id,
    ticket: req.body.ticket,
  });

  res.status(201).json(order);
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find();

  res.status(200).json(orders);
});

exports.createPaymentHook = catchAsync(async (req, res, next) => {
  const { CheckoutId, clientReference } = req.body.Data;

  if (req.body.Status === "Success") {
    const order = await Order.findById(clientReference);

    order.status = "success";
    order.reference = CheckoutId;

    order.save();
  }

  res.status(200).json({});
});
