import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const vendorSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    firstName: reqString,
    lastName: reqString,
    shopName: reqString,
    shopLogo: reqString,
    category: reqString,
    totalSale : {type:Number, required:true, default: 0},
    totalOrders: {type:Number,required:true,default:0},
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

vendorSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Vendor = mongoose.model("vendor",vendorSchema);

export default Vendor;