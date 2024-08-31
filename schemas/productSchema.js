import mongoose from "mongoose";


const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
    type:Number,
    required:true
}

const productSchema = mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendor", required: true },
    name: reqString,
    category: reqString,
    subCategory: reqString,
    costPrice: reqNumber,
    sellingPrice: reqNumber,
    totalOrders: {type:Number,required:true,default:0},
    dateCreated:{type:Date, default: Date.now},
    dateModified:{type:Date, default: Date.now}
})

productSchema.pre('save',async function(next) {
    this.dateModified = new Date();
    next();
});

const Product = mongoose.model("product",productSchema);

export default Product;