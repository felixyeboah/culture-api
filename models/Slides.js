const mongoose = require("mongoose");

const slidesSchema = new mongoose.Schema(
  {
    images: {
      type: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      required: [true, "Image links are required!"],
    },
  },
  {
    timestamps: true,
  }
);

const Slides = mongoose.model("Slides", slidesSchema);

module.exports = Slides;
