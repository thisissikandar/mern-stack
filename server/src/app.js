
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.json({limit:"15kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/', (req, res)=>{
    res.send("welcome back")
})

// Import routes
import router from './routes/user.routes.js';
import aboutRouter from "./routes/about.routes.js"

app.use("/api/v1/auth", router);
app.use("/api/v1", aboutRouter);

export {app}