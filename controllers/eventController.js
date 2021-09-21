const catchAsync = require("../utils/catchAsync");
const Event = require("../models/Event");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const upload = require("../utils/upload");
const slugify = require("slugify");

exports.uploadEventCover = upload.single("cover");

exports.getEvents = catchAsync(async (req, res) => {
  const events = await Event.find();
  res.status(200).json(events);
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findOne({ slug: id });
  if (!event) return next(new AppError("No event found!", 400));

  res.status(200).json(event);
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const { name, date, location, time } = req.body;
  const { path: cover } = req.file;

  //Check if all req exist
  if (!cover) return next(new AppError("No cover picture attached!", 400));
  if (!name) return next(new AppError("Name is required!", 400));
  if (!date) return next(new AppError("Date is required!", 400));
  if (!location) return next(new AppError("Location is required!", 400));
  if (!time) return next(new AppError("Time is required!", 400));

  const slug = slugify(`${name}${date}`, { lower: true });

  console.log("slug", slug);

  let uploadedCover = cloudinary.uploader.upload(cover, {
    resource_type: "auto",
    folder: `culture-curations/events/${slug}`,
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

  console.log("event", event);

  res.status(201).json(event);
});

exports.updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, date, time, location } = req.body;

  const { path: cover } = req.file;

  const slug = slugify(`${name}${date}`, { lower: true });

  let uploadedCover = cloudinary.uploader.upload(cover, {
    resource_type: "auto",
    folder: `culture-curations/events/${slug}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  // await all the uploadController upload functions in promise.all, exactly where the magic happens
  let coverResponse = await Promise.all([uploadedCover]);

  const coverImage = coverResponse[0].public_id;

  const event = await Event.findByIdAndUpdate(
    id,
    {
      name: name,
      date: date,
      time: time,
      location: location,
      cover: coverImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(event);
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findByIdAndDelete(id);

  if (!event) return next(new AppError("No event found!", 400));

  res.status(200).json({});
});
