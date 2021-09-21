const catchAsync = require("../utils/catchAsync");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/appError");

exports.getAllTickets = catchAsync(async (req, res) => {
  const tickets = await Ticket.find().populate("event");

  res.status(200).json(tickets);
});

exports.getTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id).populate("event");

  if (!ticket) return next(new AppError("Ticket event found!", 400));

  res.status(200).json(ticket);
});

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

exports.updateTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, people, price, options } = req.body;

  const ticket = Ticket.findByIdAndUpdate(
    id,
    {
      name: name,
      people: people,
      price: price,
      options: options,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(ticket);
});

exports.deleteTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await Ticket.findByIdAndDelete(id);

  if (!ticket) return next(new AppError("No event found!", 400));

  res.status(200).json({});
});
