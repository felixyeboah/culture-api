const catchAsync = require("../utils/catchAsync");
const Event = require("../models/Event");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary").v2;
const upload = require("../utils/upload");
const slugify = require("slugify");

exports.uploadEventCover = upload.single("cover");

exports.getEvents = catchAsync(async (req, res) => {
  const sort = {};

  if (req.query.sort && req.query.order) {
    sort[req.query.sort] = req.query.order === "desc" ? -1 : 1;
  }
  const events = await Event.find().sort("-date");
  res.status(200).json(events);
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findOne({ slug: id });
  if (!event) return next(new AppError("No event found!", 400));

  res.status(200).json(event);
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const { name, date, location, time, status } = req.body;
  const { path: cover } = req.file;

  //Check if all req exist
  if (!cover) return next(new AppError("No cover picture attached!", 400));
  if (!name) return next(new AppError("Name is required!", 400));
  if (!date) return next(new AppError("Date is required!", 400));
  if (!location) return next(new AppError("Location is required!", 400));
  if (!time) return next(new AppError("Time is required!", 400));
  if (!status) return next(new AppError("Time is required!", 400));

  const slug = slugify(`${name} ${date.split("T")[0]}`, {
    lower: true,
  });

  let uploadedCover = await cloudinary.uploader.upload(cover, {
    resource_type: "auto",
    folder: `culture-curations/events/${slug}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  const event = await Event.create({
    name: name,
    date: date.split("T")[0],
    location: location,
    time: time,
    cover: {
      public_id: uploadedCover.public_id,
      url: uploadedCover.secure_url,
    },
    status: status,
  });

  res.status(201).json(event);
});

exports.updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, date, time, location, status } = req.body;

  let uploadedCover;

  if (req.file) {
    const { path: cover, originalname } = req.file;
    uploadedCover = await cloudinary.uploader.upload(cover, {
      resource_type: "auto",
      folder: `culture-curations/events/${originalname}`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
  }

  const event = await Event.findByIdAndUpdate(
    id,
    {
      name: name,
      date: date,
      time: time,
      location: location,
      cover: {
        public_id: uploadedCover.public_id,
        url: uploadedCover.secure_url,
      },
      status: status,
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

  res.status(204).json({});
});
