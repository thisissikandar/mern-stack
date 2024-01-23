import dotenv from "dotenv"
import connectDb from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./env"
})

connectDb()
.then(()=>{
    app.on("error",(err)=>{
        console.log("Error", err);
        throw err
    })
    app.listen(process.env.APP_PORT || 3000, () =>{
       console.log(`App Running on http://localhost:${process.env.APP_PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDb Connection Failed :", err);
})