import asyncHandler from "express-async-handler";
import Orders from "../schemas/orderSchema.js";
import { findById, paginate } from "../manager/finder.js";
import Cashier from "../schemas/cashierSchema.js";
import Product from "../schemas/productSchema.js";
import Vendor from "../schemas/vendorSchemas.js";
import Payments from "../schemas/paymentSchema.js";

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { 
        productMatrix, // [{product:"prodId", unit:3}]
        cashier
     } = req.body;

     let cashierDoc = await findById(Cashier,cashier,[],'Cashier',res);

     let totalOrderSale = 0;
     let totalOrderCount = 0;

     const uniqueVendors = {} // vendorId --> [orderIds] 
     const uniqueVendorStats = {} // vendorId --> {totalCount: 0, totalSale: 0}

     for(const prodItem of productMatrix){
        let prodDoc = await findById(Product,prodItem.product,[],'Product',res);
        let vendorDoc = await findById(Vendor,prodDoc.vendor,[],'Vendor',res);
        const vendorId = prodDoc.vendor.toString();


        //Order create --> order Id store in unique vendors
        const orderDoc = await Orders.create({
            vendor:vendorDoc._id,
            product:prodDoc._id,
            cashier,
            unit: prodItem.unit,
            amountPaid: prodItem.unit * prodDoc.sellingPrice
        });
        console.log(`Created order ${JSON.stringify(orderDoc)}`)

        prodDoc.totalOrders = prodDoc.totalOrders + prodItem.unit;
        prodDoc = await prodDoc.save();
        console.log('Updated product');

        //Storing orders in uniqueVendors Hashmap
        if(vendorId in uniqueVendors){
            let existingOrdersList = uniqueVendors[vendorId];
            console.log(existingOrdersList);
            uniqueVendors[vendorId] = [...existingOrdersList,orderDoc._id]
        }else{
            uniqueVendors[vendorId] = [orderDoc._id]
        }

        if(vendorId in uniqueVendorStats){
            let existingOrderStat = uniqueVendorStats[vendorId];
            console.log(existingOrderStat,'existing order stat');
            let newOrderStat = {
                totalCount : existingOrderStat.totalCount + prodItem.unit,
                totalSale : existingOrderStat.totalSale + prodItem.unit * prodDoc.sellingPrice
            }
            uniqueVendorStats[vendorId] = newOrderStat
        }else{
            uniqueVendorStats[vendorId] = {
                totalCount :  prodItem.unit,
                totalSale : prodItem.unit * prodDoc.sellingPrice
            }
        }

        totalOrderCount += prodItem.unit;
        totalOrderSale += prodItem.unit * prodDoc.sellingPrice; 
     }

     console.log(uniqueVendors);
     console.log(uniqueVendorStats);

     console.log(totalOrderCount,totalOrderSale);

     const paymentsList = []

     Object.keys(uniqueVendors).forEach(async vendor => {
        const ordersList = uniqueVendors[vendor];
        console.log(ordersList,"TO create in payments");
        const paymentDoc = await Payments.create({
            ordersList,
            totalAmount : uniqueVendorStats[vendor].totalSale,
            status:"NOT_PAID"
        });
        console.log(paymentDoc,'Payment created')
        paymentsList.push(paymentDoc);

        let vendorDoc = await Vendor.findById(vendor);
        vendorDoc.totalSale = vendorDoc.totalSale + uniqueVendorStats[vendor].totalSale;
        vendorDoc.totalOrders = vendorDoc.totalOrders + uniqueVendorStats[vendor].totalCount;
        vendorDoc = await vendorDoc.save();
        console.log('Updated Vendor',uniqueVendorStats);
     })

     cashierDoc.totalSale = cashierDoc.totalSale + totalOrderSale;
     cashierDoc.totalOrders = cashierDoc.totalOrders + totalOrderCount;
     cashierDoc = await cashierDoc.save();

     return res.status(200).json({
        success:true,
        paymentsList,
        msg:'Orders created successfully',
        uniqueVendors: paymentsList.length
     })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});


export const createOrderV2 = asyncHandler(async (req,res) => {
    try {
        const { productMatrix, cashier } = req.body;

    // Fetch cashier document
    let cashierDoc = await findById(Cashier, cashier, [], 'Cashier', res);

    let totalOrderSale = 0;
    let totalOrderCount = 0;

    const uniqueVendors = {}; // vendorId --> [orderIds]
    const uniqueVendorStats = {}; // vendorId --> {totalCount: 0, totalSale: 0}
    const vendorCache = {}; // Cache for vendor documents

    const orderPromises = productMatrix.map(async (prodItem) => {
      let prodDoc = await findById(Product, prodItem.product, [], 'Product', res);
      const vendorId = prodDoc.vendor.toString();

      // Cache vendor to avoid redundant fetches
      if (!vendorCache[vendorId]) {
        vendorCache[vendorId] = await findById(Vendor, vendorId, [], 'Vendor', res);
      }
      let vendorDoc = vendorCache[vendorId];

      // Create the order
      const orderDoc = await Orders.create({
        vendor: vendorDoc._id,
        product: prodDoc._id,
        cashier,
        unit: prodItem.unit,
        amountPaid: prodItem.unit * prodDoc.sellingPrice,
      });

      // Update product stats
      prodDoc.totalOrders += prodItem.unit;
      await prodDoc.save();

      // Update uniqueVendors and uniqueVendorStats
      if (!uniqueVendors[vendorId]) {
        uniqueVendors[vendorId] = [];
        uniqueVendorStats[vendorId] = { totalCount: 0, totalSale: 0 };
      }

      uniqueVendors[vendorId].push(orderDoc._id);
      uniqueVendorStats[vendorId].totalCount += prodItem.unit;
      uniqueVendorStats[vendorId].totalSale += prodItem.unit * prodDoc.sellingPrice;

      totalOrderCount += prodItem.unit;
      totalOrderSale += prodItem.unit * prodDoc.sellingPrice;
    });

    await Promise.all(orderPromises); // Wait for all orders to be created

    const paymentPromises = Object.keys(uniqueVendors).map(async (vendorId) => {
      const ordersList = uniqueVendors[vendorId];

      // Create payment document
      const paymentDoc = await Payments.create({
        ordersList,
        totalAmount: uniqueVendorStats[vendorId].totalSale,
        status: 'NOT_PAID',
      });

      // Update vendor stats
      let vendorDoc = vendorCache[vendorId];
      vendorDoc.totalSale += uniqueVendorStats[vendorId].totalSale;
      vendorDoc.totalOrders += uniqueVendorStats[vendorId].totalCount;
      await vendorDoc.save();

      return paymentDoc;
    });

    const paymentsList = await Promise.all(paymentPromises);

    // Update cashier stats
    cashierDoc.totalSale += totalOrderSale;
    cashierDoc.totalOrders += totalOrderCount;
    await cashierDoc.save();

    return res.status(200).json({
      success: true,
      paymentsList,
      msg: 'Orders created successfully',
      uniqueVendors: paymentsList.length,
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchOrderById = asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        const orderDoc = await findById(Orders,id,["vendor","product","cashier"],'Orders',res);

        return res.status(200).json({
            success:true,
            orderDoc
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchOrderByVendor = asyncHandler(async (req,res) => {
    try {
        const vendorId = req.params.vendorId;

        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["vendor","cashier","product"],
          };
 
          const { documents: orders, pagination } = await paginate(
            Orders,
            {vendor:vendorId},
            options
          );

        return res.status(200).json({
            success:true,
            orders,
            pagination
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})


export const fetchOrderByCashier =asyncHandler(async (req,res) => {
    try {
        const cashierId = req.params.cashierId;

        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["vendor","cashier","product"],
          };
 
          const { documents: orders, pagination } = await paginate(
            Orders,
            {cashier:cashierId},
            options
          );

        return res.status(200).json({
            success:true,
            orders,
            pagination
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchOrderByProduct = asyncHandler(async (req,res) => {
    try {
        const productId = req.params.productId;

        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["vendor","cashier","product"],
          };
 
          const { documents: orders, pagination } = await paginate(
            Orders,
            {product:productId},
            options
          );

        return res.status(200).json({
            success:true,
            orders,
            pagination
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchAllOrders = asyncHandler(async (req,res) => {
    try {
        const options = {
            page: req.query.page,
            pageSize: req.query.pageSize,
            sortField: req.query.sortField || "dateCreated",
            sortOrder: req.query.sortOrder || "desc",
            populateFields: ["vendor","cashier","product"],
          };
 
          const { documents: orders, pagination } = await paginate(
            Orders,
            {},
            options
          );

        return res.status(200).json({
            success:true,
            orders,
            pagination
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})