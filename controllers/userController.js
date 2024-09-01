import { findById, paginate } from "../manager/finder.js";
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


  export const login = asyncHandler(async (req, res) => {
    try {
      const { phone, password } = req.body;
  
      const userDoc = await User.findOne({ phone });
  
      if (!userDoc) {
        console.log("Not a valid phone", phone);
        return res
          .status(400)
          .json({ success: false, msg: "Not a valid phone", phone });
      }
  
      if (userDoc && (await userDoc.matchPassword(password))) {
        res.status(200).json({
          success: true,
          msg: "Logged in successfull",
          userDoc,
        });
      } else {
        console.log("Incorrect password," + phone);
        return res.status(400).json({ message: "Incorrect Password." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  });

  export const fetchUserById = asyncHandler(async (req,res) => {
    try {
        const userId = req.params.userId;

        const userDoc = await findById(User,userId,[],'User',res);

        return res.status(200).json({
            success:true,
            userDoc
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
  })

  export const fetchAllUser = asyncHandler(async (req,res) => {
    try {
        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: [],
          };
      
          const { documents: users, pagination } = await paginate(
            User,
            {},
            options
          );
      
          return res.status(200).json({
            users,
            pagination,
            success: true,
          });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
  })