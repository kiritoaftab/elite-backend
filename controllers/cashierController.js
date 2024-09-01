import Cashier from "../schemas/cashierSchema.js";
import asyncHandler from "express-async-handler";
import User from "../schemas/userSchema.js";
import { findById, findByUserId, paginate } from "../manager/finder.js";

export const createCashier = asyncHandler(async (req,res) => {
    try {
        const {firstName,lastName, phone,password} = req.body;

        let userDoc = await User.findOne({phone});
        if(userDoc){
            return res.status(400).json({
                success:false,
                msg:`User already exists with ${phone}`
            })
        }

        userDoc = await User.create({
            phone,
            username:`${firstName} ${lastName}`,
            password,
            role:"CASHIER"
        })

        const cashierDoc = await Cashier.create({
            firstName,
            lastName,
            user:userDoc._id
        });

        return res.status(200).json({
            success:true,
            msg:"Cashier created successfully",
            cashierDoc
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchCashierById = asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        const cashierDoc = await findById(Cashier,id,["user"],'Cashier',res);

        return res.status(200).json({
            success:true,
            cashierDoc
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})

export const fetchCashierByUserId = asyncHandler(async (req,res) => {
    try {
        const userId = req.params.userId;

        const cashierDoc = await findByUserId(Cashier,userId,'Cashier',res);

        return res.status(200).json({
            success:true,
            cashierDoc
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})

export const fetchAllCashier = asyncHandler(async (req,res) => {
    try {
        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["user"],
          };
 
          const { documents: cashier, pagination } = await paginate(
            Cashier,
            {},
            options
          );
      
          return res.status(200).json({
            cashier,
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

export const updateCashier = asyncHandler(async (req,res) => {
    try {
        const {cashierId, firstName, lastName, password} = req.body;

        let cashierDoc = await findById(Cashier,cashierId,[],'Cashier',res);

        let userDoc = await findById(User,cashierDoc.user,[],'User',res);

        userDoc.username = `${firstName} ${lastName}`;
        userDoc.password = password;
        userDoc = await userDoc.save();

        cashierDoc.firstName = firstName;
        cashierDoc.lastName = lastName;
        cashierDoc = await cashierDoc.save();

        return res.status(200).json({
            success:true,
            cashierDoc
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})

export const deleteCashier = asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        let cashierDoc = await findById(Cashier,id,[],'Cashier',res);

        let userDoc = await User.findByIdAndDelete(cashierDoc.user);

        cashierDoc = await Cashier.findByIdAndDelete(id);

        return res.status(200).json({
            success:true,
            cashierDoc,
            userDoc,
            msg:"Cashier Deleted"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})