const cloudinary = require("cloudinary").v2;
const Upload = require("../models/Upload");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const upload = require("../utils/upload");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

exports.uploadGalleryImages = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "largeCover", maxCount: 1 },
  { name: "images", maxCount: 450 },
]);

exports.updateGalleryCover = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "largeCover", maxCount: 1 },
]);

exports.getImages = async (req, res) => {
  const images = await Upload.find();
  res.status(200).json(images);
};

exports.getSingleImage = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const image = await Upload.findOne({ slug: slug });
  if (!image) {
    return next(new AppError("Image not found!", 400));
  }
  res.status(200).json(image);
});

exports.uploads = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const { cover, images, largeCover } = req.files;

  try {
    if (!title) return next(new AppError("Title is required!", 400));

    let pictureFiles = images;
    let newCover = cover[0].path;
    let newLargeCover = largeCover[0].path;
    //Check if files exist
    if (!newCover) return next(new AppError("No cover picture attached!", 400));
    if (!newLargeCover)
      return next(new AppError("No large cover picture attached!", 400));
    if (!pictureFiles) return next(new AppError("No picture attached!", 400));

    //upload cover
    let uploadedCover = await cloudinary.uploader.upload(newCover, {
      resource_type: "auto",
      folder: `culture-curations/gallery/${title}/cover`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    //upload large cover
    let uploadedLargeCover = await cloudinary.uploader.upload(newLargeCover, {
      resource_type: "auto",
      folder: `culture-curations/gallery/${title}/largeCover`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    //map through images and create a promise array using uploadController upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.uploader.upload(picture.path, {
        resource_type: "auto",
        folder: `culture-curations/gallery/${title}`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      })
    );

    // await all the uploadController upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);

    const publicId = imageResponses.map((file) => {
      return {
        public_id: file.public_id,
        url: file.secure_url,
      };
    });

    const uploadResponse = await Upload.create({
      title: title,
      cover: {
        public_id: uploadedCover.public_id,
        url: uploadedCover.secure_url,
      },
      images: publicId,
      largeCover: {
        public_id: uploadedLargeCover.public_id,
        url: uploadedLargeCover.secure_url,
      },
    });

    res.status(201).json(uploadResponse);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

exports.updateGallery = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  //find item by ID
  const item = await Upload.findOne({ id: req.params.id });

  if (!item) return next(new AppError("No Item found with this ID!", 400));

  let uploadedCover;

  if (req.files.cover) {
    //upload cover
    uploadedCover = await cloudinary.uploader.upload(req.files.cover[0].path, {
      resource_type: "auto",
      folder: `culture-curations/gallery/${item.slug}/cover`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
  }

  let uploadedLargeCover;

  if (req.files.largeCover) {
    //upload cover
    uploadedLargeCover = await cloudinary.uploader.upload(
      req.files.largeCover[0].path,
      {
        resource_type: "auto",
        folder: `culture-curations/gallery/${item.slug}/largeCover`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }
    );
  }

  const updatedCover = await Upload.findByIdAndUpdate(
    req.params.id,
    {
      title: title,
      cover: {
        public_id: uploadedCover.public_id,
        url: uploadedCover.secure_url,
      },
      largeCover: {
        public_id: uploadedLargeCover.public_id,
        url: uploadedLargeCover.secure_url,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedCover)
    return next(new AppError("No Item found with this ID!", 400));

  res.status(200).json(updatedCover);
});

exports.deleteImage = catchAsync(async (req, res, next) => {
  const { public_id } = req.body;

  await cloudinary.uploader.destroy(public_id, {
    invalidate: true,
    resource_type: "image",
  });

  const slide = await Upload.findOneAndDelete({ images: public_id });

  if (!slide) {
    return next(new AppError("No image found with this ID!", 400));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
