const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel } = require("../models/user.model");

const { authentication } = require("../middleware/authentication");
const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      res.send({ msg: "User exists. Please login" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({ email, password: hashedPassword });
      await newUser.save();
      res.send({ msg: "User added" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ userId: user._id }, process.env.seckey, {
          expiresIn: "1h",
        });
        res.cookie("accesstoken", token, { httpOnly: true });
        res.send({ msg: "Logged in", token });
      } else {
        res.send({ msg: "Invalid email or password" });
      }
    } else {
      res.send({ msg: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
userRouter.post("/preferences", authentication, async (req, res) => {
  const userId = req.user.userId;
  console.log(userId);

  try {
    const user = await userModel.findById(userId);
    user.locations.push(req.body);
    await user.save();
    res.json({ message: "Preferences saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

userRouter.get("/preferences", authentication, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userModel.findById(userId);
    const { locations } = user;

    res.json({ locations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = { userRouter };
