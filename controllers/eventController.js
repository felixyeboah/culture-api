const catchAsync = require("../utils/catchAsync");
const Event = require("../models/Event");
const AppError = require("../utils/appError");

// exports.createEvent = catchAsync(async (req, res, next) => {
//   const { name, date, location, time } = req.body;
//   const { cover } = req.files;
//
//   //Check if cover exist
//   if (!cover) return next(new AppError("No cover picture attached!", 400));
//
//   const event = await Event.create({});
// });
