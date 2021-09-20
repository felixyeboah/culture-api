const cloudinary = require("cloudinary").v2;
const upload = require("../utils/upload");
const Slides = require("../models/Slides");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

exports.uploadSlidesImages = upload.array("slides", 30);

exports.getSlides = async (req, res) => {
  const allSlides = await Slides.find();
  res.status(200).json(allSlides);
};

exports.uploadSlides = catchAsync(async (req, res, next) => {
  try {
    let pictureFiles = req.files;
    //Check if files exist
    if (!pictureFiles) return next(new AppError("No picture attached!", 400));

    //map through images and create a promise array using uploadController upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.uploader.upload(picture.path, {
        resource_type: "auto",
        folder: "culture-curations/slides",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      })
    );
    // await all the uploadController upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);

    const publicId = imageResponses.map((file) => file.public_id);

    const uploadResponse = await Slides.create({
      images: publicId,
    });

    res.status(201).json(uploadResponse);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

exports.deleteSlide = catchAsync(async (req, res, next) => {
  // const images = await Slides.find();
  //
  // console.log("req", req.body.public_id);
  //
  // const image = images.map((item) =>
  //   item.images.filter((img) => img === req.body.public_id)
  // );
  //
  // const img = image[0];

  await cloudinary.uploader.destroy(req.body.public_id, {
    invalidate: true,
    resource_type: "image",
  });

  const slide = await Slides.findOneAndDelete({ images: req.body.public_id });

  if (!slide) {
    return next(new AppError("No image found with this ID!", 400));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
