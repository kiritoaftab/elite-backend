import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const reqString = {
  type: String,
  required: true,
};

const userSchema = mongoose.Schema({
  phone : {type:String, required:true, unique:true},
  username:reqString,
  password: reqString,
  otp:{type:String},
  role: { type: String, enum: ['ADMIN','VENDOR','CASHIER'], required: true , default:'CASHIER' },
  dateCreated:{type:Date, default: Date.now},
  dateModified:{type:Date, default: Date.now}
});

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')){
        next();
      }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt) ;
    this.dateModified = new Date();
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password);
  }


const User = mongoose.model("users", userSchema); 

export default User;