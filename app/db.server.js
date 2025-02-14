import mongoose from "mongoose";

const mongoConnect = async () => {
  try {
    let connection = await mongoose.connect('mongodb://127.0.0.1:27017/AWSEmailOrder');
    console.log("mongoDB connection successful.........🔥");
    return connection
  } catch (error) {
    console.log("Error in Database");
    return error;
  }
}

export default mongoConnect();