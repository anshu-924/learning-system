import app from './app.js';
import {config} from 'dotenv';
import connectToDB from './config/dbConnection.js';
import cloudinary from "cloudinary";
config();

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    api_key:process.env.CLOUDINARY_API_KEY,
})
const PORT=process.env.PORT || 5000;
app.listen(PORT,async ()=>{
    await connectToDB();
    console.log(`app is running at port ${PORT}`)
})
