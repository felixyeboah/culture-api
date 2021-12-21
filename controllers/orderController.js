const catchAsync = require("../utils/catchAsync");
const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/appError");
const QRCode = require("qrcode");
const email = require("../utils/sendMail");
const { v2: cloudinary } = require("cloudinary");
const ticket = require("../email/TicketEmail");
const APIFeatures = require("./../utils/apiFeatures");

exports.createOrder = catchAsync(async (req, res) => {
  if (!(req.body.id || req.body.email))
    return res.status(400).json({ message: "User is required!" });

  if (!req.body.ticket)
    return res.status(400).json({ message: "Ticket is required!" });

  let existingOrder = await Order.findOne({ email: req.body.email });
  let existingOrderId = await Order.exists({ _id: existingOrder?._id });

  if (existingOrderId && existingOrder?.status === "pending")
    return res.status(404).json({
      message: "Order exists! Please checkout.",
      data: existingOrder,
    });

  let order = await Order.create({
    user: req.body ? req.body.id : null,
    ticket: req.body.ticket,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
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

exports.saveCheckoutUrl = catchAsync(async (req, res) => {
  let existingOrder = await Order.findById(req.body.id);

  if (existingOrder.status === "pending") {
    existingOrder.checkoutUrl = req.body.url;
  } else {
    existingOrder.checkoutUrl = " ";
  }

  existingOrder.save();

  res.status(201).json({});
});

exports.getSavedCheckoutUrl = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.body.id });

  if (order?.status === "pending") {
    res.status(200).json({
      message: "success",
      data: order,
    });
  }
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

exports.getOrders = catchAsync(async (req, res) => {
  let filter = {};

  if (req.params.slug) filter = { slug: req.params.slug };

  const order = await new APIFeatures(
    Order.find()
      .populate("user", "firstName lastName email phoneNumber")
      .populate({
        path: "ticket",
        select: "name price",
        populate: { path: "event", select: "name date" },
      }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await order.query;

  res.status(200).json({
    status: "success",
    results: doc.length,
    data: doc,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name price",
      populate: { path: "event", select: "name date" },
    });

  if (!order) return next(new AppError("Order not found!", 400));
  //
  // if (order.scanned)
  //   res.status(400).json({
  //     message: "Ticket has been scanned already!",
  //   });

  order.scanned = true;

  await order.save();

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
      order.checkoutUrl = "";

      //Save order
      order.save();

      const html = ticket.TicketEmail(order);

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

exports.updateOrder = catchAsync(async (req, res) => {
  const { id, checked } = req.body;
  const order = await Order.findByIdAndUpdate(id, {
    checked,
  });

  res.status(200).json(order);
});

exports.generateQRCode = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.body.id)
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name",
      populate: { path: "event", select: "name" },
    });

  if (!order) return next(new AppError("Order not found!", 400));

  if (order.status === "success") {
    const base64QRCode = await QRCode.toDataURL(
      `https://www.curatedbyculture.com/validate?orderId=${order._id}`
    );

    let uploadedCover = await cloudinary.uploader.upload(base64QRCode, {
      resource_type: "auto",
      folder: `culture-curations/email`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    order.url = uploadedCover.url;

    //Save order
    order.save();

    const html = ticket.TicketEmail(order);

    await email.sendMail(
      order.user ? order.user.email : order.email,
      `${order.ticket.event.name} QR CODE`,
      "Your event pass!",
      html
    );
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
  const order = await Order.findById(req.body.id)
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "ticket",
      select: "name",
      populate: { path: "event", select: "name" },
    });

  if (!order) return next(new AppError("Order not found!", 400));

  const html = ticket.TicketEmail(order);

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

exports.deleteUnsucessfulOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ status: "pending" });
  if (!orders) return next(new AppError("No pending orders available!", 404));
  for (let i = 0; i < orders.length; i++) {
    await Order.findByIdAndDelete(orders[i]._id);
  }
  res.status(200).json({});
});
