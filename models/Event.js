const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
    },
    slug: String,
    cover: {
      type: String,
      required: [true, "Cover is required!"],
    },
    date: {
      type: Date,
      required: [true, "Date is required!"],
    },
    location: {
      type: String,
      required: [true, "Location is required!"],
    },
    time: {
      type: String,
      required: [true, "Time is required!"],
    },
    status: {
      type: String,
      enum: ["publish", "draft", "expired", "ongoing"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre("save", function (next) {
  this.slug = slugify(`${this.name} ${this.date}`, {
    lower: true,
  });
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
