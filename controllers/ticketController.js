const catchAsync = require("../utils/catchAsync");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/appError");

exports.createTicket = catchAsync(async (req, res, next) => {
  const { event, name, people, price, options } = req.body;

  if (!name) return next(new AppError("Name is required!", 400));
  if (!people) return next(new AppError("People is required!", 400));
  if (!price) return next(new AppError("Price is required!", 400));

  const ticket = await Ticket.create({
    event,
    name,
    people,
    price,
    options,
  });

  res.status(201).json(ticket);
});
