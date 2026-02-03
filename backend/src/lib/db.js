import mongoose from "mongoose";

export const connectDB = async () => {
  console.log("Inside connet");

  try {
    console.log("Trying to connect")
   
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB Connection Error: " + error);
  }
};
