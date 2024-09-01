import Vendor from "../schemas/vendorSchemas.js";
import User from "../schemas/userSchema.js";
import asyncHandler from "express-async-handler";
import { findById, findByUserId, paginate } from "../manager/finder.js";

export const createVendor = asyncHandler(async (req,res) => {
    try {
        const {firstName,lastName, phone,password, shopName,shopLogo,category} = req.body;

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
            role:"VENDOR"
        })

        const vendorDoc = await Vendor.create({
            firstName,
            lastName,
            user:userDoc._id,
            shopName,
            shopLogo,
            category
        });

        return res.status(200).json({
            success:true,
            msg:"Vendor created successfully",
            vendorDoc
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchVendorById = asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        const vendorDoc = await findById(Vendor,id,["user"],'Vendor',res);

        return res.status(200).json({
            success:true,
            vendorDoc
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})

export const fetchVendorByUserId = asyncHandler(async (req,res) => {
    try {
        const userId = req.params.userId;

        const vendorDoc = await findByUserId(Vendor,userId,'Vendor',res);

        return res.status(200).json({
            success:true,
            vendorDoc
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})

export const fetchAllVendors = asyncHandler(async (req,res) => {
    try {
        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["user"],
          };
 
          const { documents: vendors, pagination } = await paginate(
            Vendor,
            {},
            options
          );
      
          return res.status(200).json({
            vendors,
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

export const updateVendor = asyncHandler(async (req,res) => {
    try {
        const {vendorId, firstName, lastName, shopName, shopLogo, category, password} = req.body;

        let vendorDoc = await findById(Vendor,vendorId,[],'Vendor',res);

        let userDoc = await findById(User,vendorDoc.user,[],'User',res);

        userDoc.username = `${firstName} ${lastName}`;
        userDoc.password = password;
        userDoc = await userDoc.save();

        vendorDoc.firstName = firstName;
        vendorDoc.lastName = lastName;
        vendorDoc.shopName = shopName;
        vendorDoc.shopLogo = shopLogo;
        vendorDoc.category = category;
        vendorDoc = await vendorDoc.save();

        return res.status(200).json({
            success:true,
            vendorDoc
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error,
            success:false
        })
    }
})