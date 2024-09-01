import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
    type:Number,
    required:true
}

const orderSchema = mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendor", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    cashier : {type:mongoose.Schema.Types.ObjectId,ref : "cashier", required:true},
    unit: reqNumber,
    amountPaid: reqNumber,
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

orderSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Orders = mongoose.model("orders",orderSchema);

export default Orders;