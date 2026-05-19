const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =========================
   CREATE USER
========================= */
exports.createUser = async (userData) => {
  // Check email exists
  const existingEmail = await User.findOne({
    email: userData.email,
  });

  if (existingEmail) {
    throw new Error("Email đã tồn tại");
  }

  // Check username exists
  const existingUsername = await User.findOne({
    username: userData.username,
  });

  if (existingUsername) {
    throw new Error("Username đã tồn tại");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);

  userData.password = await bcrypt.hash(
    userData.password,
    salt
  );

  // Create user
  const user = await User.create(userData);

  // Hide password
  const userResponse = await User.findById(user._id).select(
    "-password"
  );

  return userResponse;
};

/* =========================
   GET ALL USERS
========================= */
exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

/* =========================
   GET USER BY ID
========================= */
exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

/* =========================
   UPDATE USER
========================= */
exports.updateUser = async (id, updateData) => {
  // Hash password if updated
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);

    updateData.password = await bcrypt.hash(
      updateData.password,
      salt
    );
  }

  return await User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

/* =========================
   DELETE USER
========================= */
exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};