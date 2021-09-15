import { Schema, model } from "mongoose";
const slugify = require("slugify");

const uploadSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please provide a title!"],
  },
  slug: String,
  images: {
    type: [String],
    required: [true, "Image links are required!"],
  },
  cover: {
    type: String,
    required: [true, "Cover is required!"],
  },
});

uploadSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Upload = model("Upload", uploadSchema);

module.exports = Upload;
