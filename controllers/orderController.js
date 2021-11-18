const catchAsync = require("../utils/catchAsync");
const Order = require("../models/Order");
// const User = require("../models/User");
const factory = require("./handlerFactory");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/appError");
const QRCode = require("qrcode");
const email = require("../utils/sendMail");
const { v2: cloudinary } = require("cloudinary");
const { TicketEmail } = require("../email/TicketEmail");

exports.createOrder = catchAsync(async (req, res) => {
  if (!(req.body.id || req.body.email))
    return res.status(400).json({ message: "User is required!" });

  if (!req.body.ticket)
    return res.status(400).json({ message: "Ticket is required!" });

  // const user = await User.findOne({ email: req.body.email });
  //
  // if (user)
  //   return res.status(400).json({ message: "User is already exist. Log in!" });

  let order = await Order.create({
    user: req.body ? req.body.id : null,
    ticket: req.body.ticket,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  });

  if (req.body.email) {
    order.guest = true;
  }

  await order.save();

  order = await order.populate({
    path: "ticket",
    select: "name price",
    populate: { path: "event", select: "name" },
  });

  res.status(201).json(order);
});

exports.getSales = catchAsync(async (req, res) => {
  const allSales = await Order.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        list: { $push: "$$ROOT" },
        sales: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(allSales);
});

exports.getOrders = factory.getAll(Order);

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name price",
      populate: { path: "event", select: "name date" },
    });

  if (!order) return next(new AppError("Order not found!", 400));

  res.status(200).json(order);
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

      await Ticket.findOneAndUpdate(
        { _id: order.ticket },
        {
          $inc: { quantity: -order.quantity },
        }
      );

      const base64QRCode = await QRCode.toDataURL(
        `https://www.curatedbyculture.com/validate?orderId=${order._id}`
      );

      let uploadedCover = cloudinary.uploader.upload(base64QRCode, {
        resource_type: "auto",
        folder: `culture-curations/email`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      // await all the uploadController upload functions in promise.all, exactly where the magic happens
      let coverResponse = await Promise.all([uploadedCover]);

      order.url = coverResponse[0].url;

      //Save order
      order.save();

      const html = TicketEmail(order);

      await email.sendMail(
        order.user ? order.user.email : order.email,
        `${order.ticket.event.name} QR CODE`,
        "Your event pass!",
        html
      );
    }
  }

  res.status(200).json({});
});

exports.generateQRCode = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ email: req.body.email })
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name",
      populate: { path: "event", select: "name" },
    });

  if (!order) return next(new AppError("Order not found!", 400));

  console.log("order", order);

  if (order.status === "success") {
    const base64QRCode = await QRCode.toDataURL(
      `https://www.curatedbyculture.com/validate?orderId=${order._id}`
    );

    console.log("base64QRCode", base64QRCode);

    let uploadedCover = await cloudinary.uploader.upload(base64QRCode, {
      resource_type: "auto",
      folder: `culture-curations/email`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    console.log("uploadedCover", uploadedCover);

    // order.url = uploadedCover.url;

    //Save order
    // order.save();

    // const html = TicketEmail(order);
    //
    // await email.sendMail(
    //   order.user ? order.user.email : order.email,
    //   `${order.ticket.event.name} QR CODE`,
    //   "Your event pass!",
    //   html
    // );
  } else {
    return res.status(400).json({
      message: "Sorry, you have no successful order!",
    });
  }

  res.status(200).json({
    message: "success",
  });
});

exports.sendQRCode = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ email: req.body.email })
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name",
      populate: { path: "event", select: "name" },
    });

  if (!order) return next(new AppError("Order not found!", 400));

  const html = TicketEmail(order);

  if (order.status === "success") {
    await email.sendMail(
      order.user ? order.user.email : order.email,
      `${order.ticket.event.name} QR CODE`,
      "Your event pass!",
      html
    );
  } else {
    return res.status(400).json({
      message: "You have no successful order!",
    });
  }

  res.status(200).json({
    message: "success",
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) return next(new AppError("No order found!", 400));

  res.status(204).json({});
});
