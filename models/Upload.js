const mongoose = require("mongoose");
const slugify = require("slugify");

const uploadSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

uploadSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;
