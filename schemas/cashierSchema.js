import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const cashierSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    firstName: reqString,
    lastName: reqString,
    totalSale : {type:Number, required:true, default: 0},
    totalOrders: {type:Number,required:true,default:0},
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

cashierSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Cashier = mongoose.model("cashier",cashierSchema);

export default Cashier;