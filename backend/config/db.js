const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
 
const connectDB=async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connection To MongoDB Successfully");
  }catch(error){
    console.log("The Connection Is Failed");
  }
}

module.exports=connectDB;
