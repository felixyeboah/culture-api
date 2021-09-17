const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return next(new AppError("User not found!", 400));

  res.status(200).json({
    status: "success",
    data: null,
  });
});
