const catchAsync = require("../utils/catchAsync");
const Order = require("../models/Order");
const AppError = require("../utils/appError");
const QRCode = require("qrcode");

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

exports.createPaymentHook = catchAsync(async (req, res) => {
  const {
    CheckoutId,
    ClientReference,
    CustomerPhoneNumber,
    Amount,
    SalesInvoiceId,
  } = req.body.Data;

  if (req.body.Status === "Success") {
    const order = await Order.findById(ClientReference)
      .populate("user", "firstName lastName email phoneNumber")
      .populate({
        path: "ticket",
        select: "name",
        populate: { path: "event", select: "name" },
      });
    if (order) {
      order.status = "success";
      order.reference = CheckoutId;
      order.phoneNumber = CustomerPhoneNumber;
      order.amount = Amount;
      order.invoiceId = SalesInvoiceId;

      //QRCode
      const orderData = JSON.stringify({
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phoneNumber: order.user.phoneNumber,
        ticketName: order.ticket.name,
        eventName: order.ticket.event.name,
      });

      order.url = await QRCode.toString(orderData);

      console.log("order", order);

      //Save order
      order.save();
    }
  }

  res.status(200).json({});
});
