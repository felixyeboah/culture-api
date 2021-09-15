const cloudinary = require("cloudinary").v2;

const Slides = require("../models/Slides");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

exports.getSlides = async (req, res) => {
  const allSlides = await Slides.find();
  res.status(200).json(allSlides);
};

exports.uploadSlides = async (req, res) => {
  try {
    let pictureFiles = req.files;
    console.log("pictureFiles", pictureFiles);
    //Check if files exist
    if (!pictureFiles)
      return res.status(400).json({ message: "No picture attached!" });

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

    res.status(204).json(uploadResponse);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteSlide = async (req, res) => {
  const slide = await Slides.findByIdAndDelete(req.params.id);

  if (!slide) {
    return res.status(400).json({ message: "No image found with this ID" });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
};
