import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
    name:String,
    age: Number,
    location: String
},  { timestamps: true })


export const AboutModel = mongoose.model('about', aboutSchema);