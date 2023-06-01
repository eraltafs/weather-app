const mongoose = require("mongoose");

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
  locations: [
    {
      city: {
        type: String,
        required: true,
      },
      temperatureUnit: {
        type: String,
        enum: ["Celsius", "Fahrenheit"],
        default: "Celsius",
      },
    },
  ],
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
