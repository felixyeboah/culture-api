const cloudinary = require("cloudinary").v2;
const Upload = require("../models/upload");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

exports.getImages = async (req, res) => {
  const images = await Upload.find();
  res.status(200).json(images);
};

exports.uploads = async (req, res) => {
  try {
    if (!req.body.title)
      return res.status(400).json({ message: "Title is required" });

    let pictureFiles = req.files.images;
    let cover = req.files.cover[0].path;
    //Check if files exist
    if (!cover)
      return res.status(400).json({ message: "No cover picture attached!" });
    if (!pictureFiles)
      return res.status(400).json({ message: "No picture attached!" });

    //upload cover
    let uploadedCover = cloudinary.uploader.upload(cover, {
      resource_type: "auto",
      folder: "culture-curations/images",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    //map through images and create a promise array using uploadController upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.uploader.upload(picture.path, {
        resource_type: "auto",
        folder: "culture-curations/images",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      })
    );
    // await all the uploadController upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);
    let coverResponse = await Promise.all([uploadedCover]);

    const publicId = imageResponses.map((file) => file.public_id);
    const coverImage = coverResponse[0].public_id;

    const uploadResponse = await Upload.create({
      title: req.body.title,
      cover: coverImage,
      images: publicId,
    });

    res.status(204).json(uploadResponse);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
