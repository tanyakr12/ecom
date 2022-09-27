const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [30, "Cannot exceed 30 character"],
    minlength: [4, "Name should have 4 characters or more"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: [true, "this email is already registered"],
    validate: [validator.isEmail, "Please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password should have 8 characters or more"],
    select: false, // cannot perforn mongo queries on password if false
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // making sure that hashed password is not hashed again
    next();
  }
  this.password = await bycrypt.hash(this.password, 10);
});

// JWT token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bycrypt.compare(enteredPassword, this.password);
}

// generating password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  // hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
}

module.exports = mongoose.model("user", userSchema);
