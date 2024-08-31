import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
    type:Number,
    required:true
}

const paymentSchema = mongoose.Schema({
    ordersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "orders", required: true }],
    mode: { type: String, enum: ['CASH','UPI'], required: true , default:'CASH' },
    totalAmount: reqNumber,
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

paymentSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Payments = mongoose.model("payments",paymentSchema);

export default Payments;