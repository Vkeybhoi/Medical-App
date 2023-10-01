import mongoose from "mongoose";
import { config } from "dotenv";
config();

async function connectDb(): Promise<void> {
  try {
    const cnct = await mongoose.connect(process.env.MONGO_URL!);
    // console.log(`db connected: ${cnct.connection.host}`);
    console.log(`db connected`);
  } catch (err) {
    console.error(`error: ${err}`);
  }
}

export default connectDb;
