const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required for creating an account"],
      minlength: [3, "Name should be more than 3 characters"],
      maxlength: [20, "Name should not exceed 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required for creating a user."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "Password should be more than 6 characters"],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;

  
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    ;
  } 
);

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
