import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
    type:Number,
    required:true
}

const paymentSchema = mongoose.Schema({ //NEED TO ENSURE SAME VENDORS ORDERS ARE CREATED here 
    ordersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "orders", required: true }],
    mode: { type: String, enum: ['CASH','UPI','STAFF'], required: true , default:'CASH' },
    totalAmount: reqNumber,
    status:{type:String,enum: ["PAID","NOT_PAID"], default:"NOT_PAID"},
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

paymentSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Payments = mongoose.model("payments",paymentSchema);

export default Payments;