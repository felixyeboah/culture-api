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
    cover: {
      type: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      required: [true, "Cover is required!"],
    },
    largeCover: {
      type: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      required: [true, "Large Cover is required!"],
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
