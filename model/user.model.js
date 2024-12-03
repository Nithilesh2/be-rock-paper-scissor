import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  history: [
    {
      score: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["win", "lose"],
        required: true,
      },
      datePlayed: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
