import asyncHandler from "express-async-handler";
import Payments from "../schemas/paymentSchema.js";
import { findById } from "../manager/finder.js";

export const updatePayment = asyncHandler(async (req, res) => {
  try {
    const { paymentId, status, mode } = req.body;

    let paymentDoc = await findById(Payments, paymentId, [], "Payments", res);

    paymentDoc.status = status;
    paymentDoc.mode = mode;
    paymentDoc = await paymentDoc.save();

    return res.status(200).json({
      success: true,
      paymentDoc,
      msg: "Update payment",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const updatePaymentsList = asyncHandler(async (req, res) => {
  try {
    const { paymentIds, status, mode } = req.body;

    // Update all payments that match the given payment IDs
    const result = await Payments.updateMany(
      { _id: { $in: paymentIds } }, // Find payments where the _id is in the paymentIds array
      { $set: { status, mode } } // Set the status and mode for these payments
    );

    return res.status(200).json({
      success: true,
      msg: "Updated payments list",
      updatedCount: result.nModified, // Number of documents that were modified
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const fetchPaymentById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const payment = await Payments.findById(id).populate({
      path: "ordersList",
      populate: [
        { path: "vendor", model: "vendor" },
        { path: "cashier", model: "cashier" },
        { path: "product", model: "product" },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const fetchPaymentsByIds = asyncHandler(async (req, res) => {
  try {
    const { paymentIds } = req.body; // Expecting an array of payment IDs in the request body

    // Fetch the payments with the given IDs and populate the ordersList and its nested fields
    const payments = await Payments.find({ _id: { $in: paymentIds } }).populate(
      {
        path: "ordersList",
        populate: [
          { path: "vendor", model: "vendor" },
          { path: "cashier", model: "cashier" },
          { path: "product", model: "product" },
        ],
      }
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "Payments not found",
      });
    }

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const fetchAllPayments = asyncHandler(async (req, res) => {
  try {
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    const sortField = req.query.sortField || "dateCreated";
    const sortOrder = req.query.sortOrder || "desc";
    
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const startIndex = (page - 1) * pageSize;

    const totalDocuments = await Payments.countDocuments();
    const totalPages = Math.ceil(totalDocuments / pageSize);

    const payments = await Payments.find({})
      .populate({
        path: "ordersList",
        populate: [
          { path: "vendor", model: "vendor" },
          { path: "cashier", model: "cashier" },
          { path: "product", model: "product" },
        ],
      })
      .sort(sort)
      .skip(startIndex)
      .limit(pageSize);

    return res.status(200).json({
      payments,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const fetchPaymentReports = asyncHandler(async (req,res) => {
  try {

    const totalCash = await Payments.aggregate([
      {
        $match: { mode: "CASH", status: "PAID" }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Total for UPI
    const totalUpi = await Payments.aggregate([
      {
        $match: { mode: "UPI", status: "PAID" }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Total for STAFF
    const totalStaff = await Payments.aggregate([
      {
        $match: { mode: "STAFF", status: "PAID" }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Return totals in the response
    return res.status(200).json({
      success: true,
      cashPaid: totalCash.length > 0 ? totalCash[0].totalAmount : 0,
      upiPaid: totalUpi.length > 0 ? totalUpi[0].totalAmount : 0,
      staffPaid: totalStaff.length > 0 ? totalStaff[0].totalAmount : 0
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success:false,
      error
    })
  }
})
