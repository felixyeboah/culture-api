import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide a name!"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a name!"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number!"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    gender: {
      type: String,
      required: [false, "Please provide a gender!"],
    },
    age: {
      type: Number,
      required: [false, "Please provide an age!"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    token: {
      type: String,
      required: false,
    },
    resetCode: {
      type: String,
      required: false,
    },
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createResetCode = function () {
  const resetCode = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  this.resetCode = resetCode;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

const User = model("User", userSchema);

module.exports = User;
