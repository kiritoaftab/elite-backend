import asyncHandler from "express-async-handler";
import Payments from "../schemas/paymentSchema.js";
import { findById } from "../manager/finder.js";

export const updatePayment = asyncHandler(async (req,res) => {
    try{
        const {paymentId, status, mode} = req.body;

        let paymentDoc = await findById(Payments,paymentId,[],'Payments',res);

        paymentDoc.status = status;
        paymentDoc.mode = mode;
        paymentDoc =await paymentDoc.save();

        return res.status(200).json({
            success:true,
            paymentDoc,
            msg:'Update payment'
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const updatePaymentsList = asyncHandler(async (req, res) => {
    try {
        const { paymentIds, status, mode } = req.body;

        // Update all payments that match the given payment IDs
        const result = await Payments.updateMany(
            { _id: { $in: paymentIds } }, // Find payments where the _id is in the paymentIds array
            { $set: { status, mode } }     // Set the status and mode for these payments
        );

        return res.status(200).json({
            success: true,
            msg: 'Updated payments list',
            updatedCount: result.nModified // Number of documents that were modified
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error
        });
    }
});


export const fetchPaymentById =asyncHandler(async (req,res) => {
    try {
        const id = req.params.id;

        const payment = await Payments.findById(id)
            .populate({
                path: 'ordersList',
                populate: [
                    { path: 'vendor', model: 'vendor' },
                    { path: 'cashier', model: 'cashier' },
                    { path: 'product', model: 'product' }
                ]
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                msg: 'Payment not found'
            });
        }

        return res.status(200).json({
            success: true,
            payment
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error
        })
    }
})

export const fetchPaymentsByIds = asyncHandler(async (req, res) => {
    try {
        const { paymentIds } = req.body; // Expecting an array of payment IDs in the request body

        // Fetch the payments with the given IDs and populate the ordersList and its nested fields
        const payments = await Payments.find({ _id: { $in: paymentIds } })
            .populate({
                path: 'ordersList',
                populate: [
                    { path: 'vendor', model: 'vendor' },
                    { path: 'cashier', model: 'cashier' },
                    { path: 'product', model: 'product' }
                ]
            });

        if (!payments || payments.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Payments not found'
            });
        }

        return res.status(200).json({
            success: true,
            payments
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error
        });
    }
});
