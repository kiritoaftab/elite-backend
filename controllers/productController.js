import asyncHandler from "express-async-handler";
import Product from "../schemas/productSchema.js";
import Vendor from '../schemas/vendorSchemas.js';
import { findById, paginate } from "../manager/finder.js";
import mongoose from "mongoose";



export const createProduct = asyncHandler(async (req,res) => {
    try {
        const { name, category, subCategory,costPrice, sellingPrice, vendor } = req.body;

        let productDoc = await Product.findOne({
            name,
            vendor
        });
        if(productDoc) {
            return res.status(400).json({
                success:false,
                msg:`Cannot add same product ${name} to vendor`
            })
        }

        productDoc = await Product.create({
            name,
            category,
            subCategory,
            costPrice,
            sellingPrice,
            vendor
        });

        return res.status(200).json({
            productDoc,
            success:true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchProductById = asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        const productDoc = await findById(Product,id,["vendor"],'Product',res);

        return res.status(200).json({
            success:true,
            productDoc
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchProductByVendor = asyncHandler(async (req,res) => {
    try {
        const vendorId = req.params.vendorId;

        const products = await Product.find({
            vendor:vendorId
        }).populate("vendor").exec();

        if(products.length == 0){
            return res.status(404).json({
                success:false,
                msg:'No products found for vendor'
            })
        }

        return res.status(200).json({
            success:true,
            products
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchAllProducts = asyncHandler(async (req,res) => {
    try {
        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["vendor"],
          };
 
          const { documents: products, pagination } = await paginate(
            Product,
            {},
            options
          );
      
          return res.status(200).json({
            products,
            pagination,
            success: true,
          });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const updateProduct = asyncHandler(async (req,res) => {
    try {
        const {productId, vendor, name, category, subCategory, costPrice, sellingPrice,status} = req.body;

        let productDoc = await findById(Product,productId,[],'Product',res);

        productDoc.vendor = vendor;
        productDoc.name = name;
        productDoc.category = category;
        productDoc.subCategory = subCategory;
        productDoc.costPrice = costPrice;
        productDoc.sellingPrice = sellingPrice;
        productDoc.status = status;

        productDoc = await productDoc.save();


        return res.status(200).json({
            success:true,
            productDoc
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})


export const getTotalProductCount = asyncHandler(async (req,res) => {
    try {
        const totalProducts = await Product.countDocuments();
        return res.status(200).json({
            success:true,
            totalProducts
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const getTotalProfit = asyncHandler(async (req,res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProfit: {
                        $sum: {
                            $multiply: [
                                { $subtract: ["$sellingPrice", "$costPrice"] },
                                "$totalOrders"
                            ]
                        }
                    }
                }
            }
        ]);

        const totalProfit = result[0]?.totalProfit || 0;

        return res.status(200).json({
            success:true,
            totalProfit
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const getTotalOrders = asyncHandler(async (req,res) => {
    try {
        const result = await Product.aggregate()
        .group({
            _id: null, 
            totalOrders: {$sum : "$totalOrders"}
        });

        const totalOrders = result[0] ? result[0].totalOrders : 0;

        return res.status(200).json({
            success:true,
            totalOrders
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:true,
            error
        })
    }
})

export const fetchProductsByName = asyncHandler(async (req,res) => {
    try {
        const query = req.params.query;
        const regexPattern = new RegExp(query, "i");

        const products = await Product.find({
            name: { $regex: regexPattern },
          });
      
        return res.status(200).json({
            success:true,
            products
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchSalesStatByVendor = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.params.vendor; // Vendor ID from params

        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        const stats = await Product.aggregate([
            {
                $match: {
                    vendor: vendorObjectId, // Match the vendor
                },
            },
            {
                $addFields: {
                    totalSales: { $multiply: ["$totalOrders", "$sellingPrice"] }, // totalOrders * sellingPrice
                    totalCost: { $multiply: ["$totalOrders", "$costPrice"] },     // totalOrders * costPrice
                    totalProfit: {
                        $multiply: ["$totalOrders", { $subtract: ["$sellingPrice", "$costPrice"] }], // totalOrders * (sellingPrice - costPrice)
                    },
                },
            },
            {
                $group: {
                    _id: "$vendor",
                    totalSales: { $sum: "$totalSales" },   // Sum of totalSales
                    totalCost: { $sum: "$totalCost" },     // Sum of totalCost
                    totalProfit: { $sum: "$totalProfit" }, // Sum of totalProfit
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: stats[0] || { totalSales: 0, totalCost: 0, totalProfit: 0 }, // Return 0 if no data found
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error,
        });
    }
});


export const resetDatabase = asyncHandler(async (req,res) => {
    try {
        await Product.updateMany({}, { $set: { totalOrders: 0 } });  // Reset all totalOrders to 0

        await Vendor.updateMany({},{$set : {totalSale: 0, totalOrders: 0 }})

        return res.status(200).json({
            success: true,
            message: "All product orders have been reset to 0"
        });
    } catch (error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        error
       }) 
    }
})