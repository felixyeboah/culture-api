const mongoose = require("mongoose");

const slidesSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: [true, "Image links are required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Slides = mongoose.model("Slides", slidesSchema);

module.exports = Slides;
