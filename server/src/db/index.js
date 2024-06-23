import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export let dbInstance = undefined;
const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    dbInstance = connectionInstance;
    console.log(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    console.log("MONGODB Connection Error ::", error);
    process.exit(1);
  }
};

export default connectDb;
