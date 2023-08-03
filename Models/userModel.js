const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: Number,
    address: String,
    password: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") ) {
    //create password secure with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  }
});

module.exports = new mongoose.model("User", userSchema);
