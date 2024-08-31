import User from "../schemas/userSchema.js";
import asyncHandler from 'express-async-handler';

export const createAdmin = asyncHandler(async (req, res) => {
    try {
      const { phone, username, password } = req.body;
  
      let userDoc = await User.findOne({ phone });
      if (userDoc) {
        console.log("Already existing phone", phone);
        return res.status(400).json({
          success: false,
          msg: "Already existing phone"+ phone,
        });
      }
  
      userDoc = await User.create({
        username,
        phone,
        password,
        role: "ADMIN",
      });
  
      return res.status(200).json({
        success: true,
        userDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  });