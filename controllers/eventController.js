const catchAsync = require("../utils/catchAsync");
const Event = require("../models/Event");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;

exports.getEvents = catchAsync(async (req, res) => {
  const events = await Event.find();
  res.status(200).json(events);
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const { name, date, location, time } = req.body;
  const { path: cover } = req.file;

  //Check if cover exist
  if (!cover) return next(new AppError("No cover picture attached!", 400));

  let uploadedCover = cloudinary.uploader.upload(cover, {
    resource_type: "auto",
    folder: `culture-curations/events/${name}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  // await all the uploadController upload functions in promise.all, exactly where the magic happens
  let coverResponse = await Promise.all([uploadedCover]);

  const coverImage = coverResponse[0].public_id;

  const event = await Event.create({
    name: name,
    date: date,
    location: location,
    time: time,
    cover: coverImage,
  });

  res.status(201).json(event);
});
